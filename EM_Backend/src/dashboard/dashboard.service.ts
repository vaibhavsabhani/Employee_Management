import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /* ── helpers ──────────────────────────────────── */
  private utcDay(offsetDays = 0) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + offsetDays);
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const end   = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
    return { start, end };
  }

  private utcMonth(offsetMonths = 0) {
    const d = new Date();
    d.setUTCMonth(d.getUTCMonth() + offsetMonths);
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
    const end   = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    return { start, end };
  }

  private readonly MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  private readonly DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  /* ════════════════════════════════════════════════
     ADMIN DASHBOARD
     ════════════════════════════════════════════════ */
  async getAdminDashboard() {
    const today = this.utcDay();
    const thisMonth = this.utcMonth();

    const employeeRole = await this.prisma.role.findUnique({ where: { name: 'employee' } });
    const roleId = employeeRole?.id;

    const [
      totalEmployees,
      activeEmployees,
      todayPresent,
      todayAbsent,
      pendingTimeEntries,
      pendingLeaveRequests,
      approvedLeavesToday,
      monthlyApprovedHours,
    ] = await Promise.all([
      this.prisma.user.count({ where: { roleId } }),
      this.prisma.user.count({ where: { roleId, isActive: true } }),
      this.prisma.attendance.count({ where: { date: { gte: today.start, lte: today.end }, statusId: 1, isActive: true } }),
      this.prisma.attendance.count({ where: { date: { gte: today.start, lte: today.end }, statusId: 2, isActive: true } }),
      this.prisma.timeEntry.count({ where: { statusId: 1, isActive: true } }),
      this.prisma.leave.count({ where: { statusId: 1, isActive: true } }),
      this.prisma.leave.count({
        where: { startDate: { lte: today.end }, endDate: { gte: today.start }, statusId: 2, isActive: true },
      }),
      this.prisma.timeEntry.aggregate({
        where: { date: { gte: thisMonth.start, lte: thisMonth.end }, statusId: 2, isActive: true },
        _sum: { duration: true },
      }),
    ]);

    const todayNotMarked = Math.max(0, activeEmployees - todayPresent - todayAbsent - approvedLeavesToday);

    const [attendanceTrend, timeEntryTrend, leaveDistribution, recentPendingLeaves, recentPendingTimeEntries] =
      await Promise.all([
        this.buildAttendanceTrend(),
        this.buildTimeEntryTrend(),
        this.buildLeaveDistribution(),
        this.prisma.leave.findMany({
          where: { statusId: 1, isActive: true },
          include: { employee: { select: { firstName: true, lastName: true } }, leaveType: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        this.prisma.timeEntry.findMany({
          where: { statusId: 1, isActive: true },
          include: { employee: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

    return {
      stats: {
        totalEmployees,
        activeEmployees,
        todayPresent,
        todayAbsent,
        todayOnLeave: approvedLeavesToday,
        todayNotMarked,
        pendingTimeEntries,
        pendingLeaveRequests,
        monthlyApprovedHours: Math.round((monthlyApprovedHours._sum.duration ?? 0) / 60),
      },
      attendanceTrend,
      timeEntryTrend,
      leaveDistribution,
      recentPendingLeaves: recentPendingLeaves.map((l) => ({
        id: l.id,
        employeeName: `${l.employee.firstName} ${l.employee.lastName}`,
        leaveType: (l as any).leaveType.name,
        startDate: l.startDate,
        endDate: l.endDate,
        totalDays: l.totalDays,
      })),
      recentPendingTimeEntries: recentPendingTimeEntries.map((t) => ({
        id: t.id,
        employeeName: `${t.employee.firstName} ${t.employee.lastName}`,
        date: t.date,
        duration: t.duration,
        startTime: t.startTime,
        endTime: t.endTime,
      })),
    };
  }

  private async buildAttendanceTrend() {
    const results: { date: string; present: number; absent: number; onLeave: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const { start, end } = this.utcDay(-i);
      const [present, absent, onLeave] = await Promise.all([
        this.prisma.attendance.count({ where: { date: { gte: start, lte: end }, statusId: 1, isActive: true } }),
        this.prisma.attendance.count({ where: { date: { gte: start, lte: end }, statusId: 2, isActive: true } }),
        this.prisma.leave.count({ where: { startDate: { lte: end }, endDate: { gte: start }, statusId: 2, isActive: true } }),
      ]);
      results.push({ date: this.DAY_NAMES[start.getUTCDay()], present, absent, onLeave });
    }
    return results;
  }

  private async buildTimeEntryTrend() {
    const results: { month: string; totalHours: number; entries: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const { start, end } = this.utcMonth(-i);
      const agg = await this.prisma.timeEntry.aggregate({
        where: { date: { gte: start, lte: end }, isActive: true },
        _sum: { duration: true },
        _count: true,
      });
      results.push({
        month: this.MONTH_NAMES[start.getUTCMonth()],
        totalHours: Math.round((agg._sum.duration ?? 0) / 60),
        entries: agg._count,
      });
    }
    return results;
  }

  private async buildLeaveDistribution() {
    const types = await this.prisma.leaveType.findMany({ where: { isActive: true } });
    const rows = await Promise.all(
      types.map(async (type) => {
        const agg = await this.prisma.leave.aggregate({
          where: { leaveTypeId: type.id, isActive: true },
          _count: true,
          _sum: { totalDays: true },
        });
        return { type: type.name, count: agg._count, days: agg._sum.totalDays ?? 0 };
      }),
    );
    return rows.filter((r) => r.count > 0);
  }

  /* ════════════════════════════════════════════════
     EMPLOYEE DASHBOARD
     ════════════════════════════════════════════════ */
  async getEmployeeDashboard(employeeId: string) {
    const thisMonth = this.utcMonth();
    const yearStart = new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1));

    const [totalStats, approvedStats, pendingStats, pendingLeaves, approvedLeaves, rejectedLeaves] =
      await Promise.all([
        this.prisma.timeEntry.aggregate({
          where: { employeeId, date: { gte: thisMonth.start, lte: thisMonth.end }, isActive: true },
          _sum: { duration: true },
          _count: true,
        }),
        this.prisma.timeEntry.aggregate({
          where: { employeeId, date: { gte: thisMonth.start, lte: thisMonth.end }, isActive: true, statusId: 2 },
          _sum: { duration: true },
        }),
        this.prisma.timeEntry.aggregate({
          where: { employeeId, date: { gte: thisMonth.start, lte: thisMonth.end }, isActive: true, statusId: 1 },
          _sum: { duration: true },
        }),
        this.prisma.leave.count({ where: { employeeId, statusId: 1, isActive: true, startDate: { gte: yearStart } } }),
        this.prisma.leave.count({ where: { employeeId, statusId: 2, isActive: true, startDate: { gte: yearStart } } }),
        this.prisma.leave.count({ where: { employeeId, statusId: 3, isActive: true, startDate: { gte: yearStart } } }),
      ]);

    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      this.prisma.timeEntry.count({ where: { employeeId, isActive: true, statusId: 1 } }),
      this.prisma.timeEntry.count({ where: { employeeId, isActive: true, statusId: 2 } }),
      this.prisma.timeEntry.count({ where: { employeeId, isActive: true, statusId: 3 } }),
    ]);

    const [weeklyHours, monthlyHours, leavesByType, recentTimeEntries] = await Promise.all([
      this.buildWeeklyHours(employeeId),
      this.buildMonthlyHours(employeeId),
      this.buildLeavesByType(employeeId),
      this.prisma.timeEntry.findMany({
        where: { employeeId, isActive: true },
        include: { status: true },
        orderBy: { date: 'desc' },
        take: 5,
      }),
    ]);

    return {
      stats: {
        totalHoursThisMonth: Math.round(((totalStats._sum.duration ?? 0) / 60) * 10) / 10,
        approvedHours: Math.round(((approvedStats._sum.duration ?? 0) / 60) * 10) / 10,
        pendingHours: Math.round(((pendingStats._sum.duration ?? 0) / 60) * 10) / 10,
        totalEntriesThisMonth: totalStats._count,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves,
      },
      weeklyHours,
      monthlyHours,
      timeEntryStatus: [
        { status: 'Pending',  count: pendingCount },
        { status: 'Approved', count: approvedCount },
        { status: 'Rejected', count: rejectedCount },
      ],
      leavesByType,
      recentTimeEntries: recentTimeEntries.map((t) => ({
        id: t.id,
        date: t.date,
        startTime: t.startTime,
        endTime: t.endTime,
        duration: t.duration,
        status: (t as any).status?.name,
        statusId: t.statusId,
        notes: t.notes,
      })),
    };
  }

  private async buildWeeklyHours(employeeId: string) {
    const results: { day: string; hours: number; date: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const { start, end } = this.utcDay(-i);
      const agg = await this.prisma.timeEntry.aggregate({
        where: { employeeId, date: { gte: start, lte: end }, isActive: true },
        _sum: { duration: true },
      });
      results.push({
        day: this.DAY_NAMES[start.getUTCDay()],
        hours: Math.round(((agg._sum.duration ?? 0) / 60) * 10) / 10,
        date: start.toISOString().split('T')[0],
      });
    }
    return results;
  }

  private async buildMonthlyHours(employeeId: string) {
    const results: { month: string; hours: number; entries: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const { start, end } = this.utcMonth(-i);
      const agg = await this.prisma.timeEntry.aggregate({
        where: { employeeId, date: { gte: start, lte: end }, isActive: true },
        _sum: { duration: true },
        _count: true,
      });
      results.push({
        month: this.MONTH_NAMES[start.getUTCMonth()],
        hours: Math.round(((agg._sum.duration ?? 0) / 60) * 10) / 10,
        entries: agg._count,
      });
    }
    return results;
  }

  private async buildLeavesByType(employeeId: string) {
    const types = await this.prisma.leaveType.findMany({ where: { isActive: true } });
    const rows = await Promise.all(
      types.map(async (type) => {
        const agg = await this.prisma.leave.aggregate({
          where: { employeeId, leaveTypeId: type.id, isActive: true },
          _count: true,
          _sum: { totalDays: true },
        });
        return { type: type.name, count: agg._count, days: agg._sum.totalDays ?? 0 };
      }),
    );
    return rows.filter((r) => r.count > 0);
  }
}
