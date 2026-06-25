import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { GetAttendanceDto } from './dto/get-attendance.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async getAttendance(query: GetAttendanceDto) {
    const {
      page = '1',
      limit = '10',
      date,
      employeeName,
      employeeEmail,
      statusFilter,
    } = query;

    const skip = (Number(page) - 1) * Number(limit);

    const dateStr = date || (() => {
      const d = new Date();
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    })();

    const targetDate = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const leaveFilter = {
      statusId: 2,
      startDate: { lte: endOfDay },
      endDate: { gte: targetDate },
      isActive: true,
    };
    const hasLeave = { some: leaveFilter };
    const noLeave = { none: leaveFilter };

    const attendanceFilter = { date: targetDate, isActive: true };
    const hasPresentRecord = { some: { ...attendanceFilter, statusId: 1 } };
    const hasAbsentRecord = { some: { ...attendanceFilter, statusId: 2 } };
    const noAttendanceRecord = { none: attendanceFilter };

    const employeeRole = await this.prisma.role.findUnique({ where: { name: 'employee' } });
    if (!employeeRole) {
      return this.emptyResponse(dateStr, 0);
    }

    const baseWhere: any = { isActive: true, roleId: employeeRole.id };
    if (employeeName) {
      baseWhere.OR = [
        { firstName: { contains: employeeName, mode: 'insensitive' } },
        { lastName: { contains: employeeName, mode: 'insensitive' } },
      ];
    }
    if (employeeEmail) {
      baseWhere.email = { contains: employeeEmail, mode: 'insensitive' };
    }

    const queryWhere = { ...baseWhere };

    if (statusFilter === 'present') {
      queryWhere.attendances = hasPresentRecord;
      queryWhere.employeeLeaves = noLeave;
    } else if (statusFilter === 'absent') {
      queryWhere.attendances = hasAbsentRecord;
      queryWhere.employeeLeaves = noLeave;
    } else if (statusFilter === 'on-leave') {
      queryWhere.employeeLeaves = hasLeave;
    } else if (statusFilter === 'not-marked') {
      queryWhere.attendances = noAttendanceRecord;
      queryWhere.employeeLeaves = noLeave;
    }

    const [employees, total] = await Promise.all([
      this.prisma.user.findMany({
        where: queryWhere,
        select: { id: true, firstName: true, lastName: true, email: true },
        skip,
        take: Number(limit),
        orderBy: { firstName: 'asc' },
      }),
      this.prisma.user.count({ where: queryWhere }),
    ]);

    // Stats always from baseWhere (no status condition)
    const [totalAll, presentAll, onLeaveAll, absentAll] = await Promise.all([
      this.prisma.user.count({ where: baseWhere }),
      this.prisma.user.count({ where: { ...baseWhere, attendances: hasPresentRecord, employeeLeaves: noLeave } }),
      this.prisma.user.count({ where: { ...baseWhere, employeeLeaves: hasLeave } }),
      this.prisma.user.count({ where: { ...baseWhere, attendances: hasAbsentRecord, employeeLeaves: noLeave } }),
    ]);

    const stats = {
      total: totalAll,
      present: presentAll,
      onLeave: onLeaveAll,
      absent: absentAll,
      notMarked: totalAll - presentAll - onLeaveAll - absentAll,
    };

    if (!employees.length) return { ...this.emptyResponse(dateStr, total), stats };

    const employeeIds = employees.map((e) => e.id);

    const [attendances, leaves] = await Promise.all([
      this.prisma.attendance.findMany({
        where: { employeeId: { in: employeeIds }, date: targetDate, isActive: true },
        include: {
          markedBy: { select: { id: true, firstName: true, lastName: true } },
          status: true,
        },
      }),
      this.prisma.leave.findMany({
        where: {
          employeeId: { in: employeeIds },
          ...leaveFilter,
        },
        include: { leaveType: true },
      }),
    ]);

    const attendanceMap = new Map(attendances.map((a) => [a.employeeId, a]));
    const leaveMap = new Map(leaves.map((l) => [l.employeeId, l]));

    const data = employees.map((emp) => {
      const attendance = attendanceMap.get(emp.id) || null;
      const leave = leaveMap.get(emp.id) || null;

      let effectiveStatus: 'present' | 'absent' | 'on-leave' | 'not-marked';
      if (leave) effectiveStatus = 'on-leave';
      else if (attendance?.statusId === 1) effectiveStatus = 'present';
      else if (attendance?.statusId === 2) effectiveStatus = 'absent';
      else effectiveStatus = 'not-marked';

      return { employee: emp, effectiveStatus, attendance, leave };
    });

    return {
      success: true,
      date: dateStr,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      data,
      stats,
    };
  }

  async markAttendance(adminId: string, dto: MarkAttendanceDto) {
    const { employeeId, date, statusId, notes } = dto;
    const targetDate = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    // Block marking if employee has approved leave on this date
    const leave = await this.prisma.leave.findFirst({
      where: {
        employeeId,
        statusId: 2,
        startDate: { lte: endOfDay },
        endDate: { gte: targetDate },
        isActive: true,
      },
    });

    if (leave) {
      throw new BadRequestException(
        'Cannot manually mark attendance for an employee on approved leave',
      );
    }

    const attendance = await this.prisma.attendance.upsert({
      where: { employeeId_date: { employeeId, date: targetDate } },
      create: { employeeId, date: targetDate, statusId, markedById: adminId, notes },
      update: { statusId, markedById: adminId, notes },
      include: {
        status: true,
        markedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await this.notificationService.create(
      employeeId,
      'Attendance Marked',
      `Your attendance for ${date} has been marked as ${attendance.status.name}`,
      'attendance_marked',
      { date, statusId },
    );

    return {
      success: true,
      message: `Employee marked as ${attendance.status.name}`,
      data: attendance,
    };
  }

  async getMyAttendance(employeeId: string, query: { month?: string }) {
    const now = new Date();
    const monthStr =
      query.month ||
      `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

    const [year, month] = monthStr.split('-').map(Number);

    const firstDay = new Date(Date.UTC(year, month - 1, 1));
    const lastDayOfMonth = new Date(Date.UTC(year, month, 0));
    const todayUtc = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    const emptyStats = {
      totalDays: 0,
      present: 0,
      absent: 0,
      onLeave: 0,
      notMarked: 0,
    };

    // Whole month is in the future — nothing to show yet.
    if (firstDay > todayUtc) {
      return { success: true, month: monthStr, data: [], stats: emptyStats };
    }

    const endDay = lastDayOfMonth > todayUtc ? todayUtc : lastDayOfMonth;
    const rangeEnd = new Date(endDay);
    rangeEnd.setUTCHours(23, 59, 59, 999);

    const [attendances, leaves] = await Promise.all([
      this.prisma.attendance.findMany({
        where: {
          employeeId,
          date: { gte: firstDay, lte: rangeEnd },
          isActive: true,
        },
        include: {
          status: true,
          markedBy: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.leave.findMany({
        where: {
          employeeId,
          statusId: 2,
          isActive: true,
          startDate: { lte: rangeEnd },
          endDate: { gte: firstDay },
        },
        include: { leaveType: true },
      }),
    ]);

    const dateKey = (d: Date) =>
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

    const attendanceMap = new Map(attendances.map((a) => [dateKey(a.date), a]));

    const stats = { totalDays: 0, present: 0, absent: 0, onLeave: 0, notMarked: 0 };
    const data: any[] = [];

    // Walk each day from most recent back to the start of the month.
    for (let t = endDay.getTime(); t >= firstDay.getTime(); t -= 86400000) {
      const day = new Date(t);
      const dayStart = new Date(t);
      const dayEnd = new Date(t);
      dayEnd.setUTCHours(23, 59, 59, 999);

      const leave = leaves.find(
        (l) => l.startDate <= dayEnd && l.endDate >= dayStart,
      );
      const attendance = attendanceMap.get(dateKey(day)) || null;

      let effectiveStatus: 'present' | 'absent' | 'on-leave' | 'not-marked';
      let leaveType: any = null;
      let markedBy: any = null;

      if (leave) {
        effectiveStatus = 'on-leave';
        leaveType = leave.leaveType;
        stats.onLeave++;
      } else if (attendance?.statusId === 1) {
        effectiveStatus = 'present';
        markedBy = attendance.markedBy;
        stats.present++;
      } else if (attendance?.statusId === 2) {
        effectiveStatus = 'absent';
        markedBy = attendance.markedBy;
        stats.absent++;
      } else {
        effectiveStatus = 'not-marked';
        stats.notMarked++;
      }

      stats.totalDays++;
      data.push({
        date: dateKey(day),
        effectiveStatus,
        leaveType,
        markedBy,
        notes: attendance?.notes ?? null,
      });
    }

    return { success: true, month: monthStr, data, stats };
  }

  private emptyResponse(dateStr: string, total: number) {
    return {
      success: true,
      date: dateStr,
      page: 1,
      limit: 10,
      total,
      totalPages: 0,
      data: [],
      stats: { total: 0, present: 0, onLeave: 0, absent: 0, notMarked: 0 },
    };
  }
}
