import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { GetLeaveDto } from './dto/get-leave.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';

@Injectable()
export class LeaveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  private calcTotalDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  async create(employeeId: string, dto: CreateLeaveDto) {
    const { leaveTypeId, startDate, reason } = dto;
    const isHalfDay = dto.isHalfDay ?? false;
    const endDate = isHalfDay ? startDate : dto.endDate;
    const halfDaySession = isHalfDay ? dto.halfDaySession : null;

    if (isHalfDay && !halfDaySession) {
      throw new BadRequestException(
        'Please select which half of the day (first or second)',
      );
    }

    if (new Date(endDate) < new Date(startDate)) {
      throw new BadRequestException('End date cannot be before start date');
    }

    const leaveType = await this.prisma.leaveType.findUnique({
      where: { id: leaveTypeId },
    });
    if (!leaveType) throw new BadRequestException('Invalid leave type');

    const overlap = await this.prisma.leave.findFirst({
      where: {
        employeeId,
        isActive: true,
        statusId: { not: 3 },
        OR: [
          {
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(startDate) },
          },
        ],
      },
    });
    if (overlap) {
      throw new BadRequestException(
        'A leave request already exists for this date range',
      );
    }

    const totalDays = isHalfDay ? 0.5 : this.calcTotalDays(startDate, endDate);

    const leave = await this.prisma.leave.create({
      data: {
        employeeId,
        leaveTypeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays,
        isHalfDay,
        halfDaySession,
        reason,
        statusId: 1,
      },
      include: { leaveType: true, status: true },
    });

    const employee = await this.prisma.user.findUnique({
      where: { id: employeeId },
      select: { firstName: true, lastName: true },
    });
    const days = leave.totalDays;
    const durationLabel = isHalfDay
      ? `Half day · ${halfDaySession === 'first_half' ? 'First Half' : 'Second Half'}`
      : `${days} day${days > 1 ? 's' : ''}`;
    await this.notificationService.notifyAllAdmins(
      'New Leave Request',
      `${employee?.firstName} ${employee?.lastName} applied for ${leave.leaveType.name} leave (${durationLabel})`,
      'leave_applied',
      { leaveId: leave.id },
    );

    return { success: true, message: 'Leave request submitted successfully', data: leave };
  }

  async getMyLeaves(employeeId: string, query: GetLeaveDto) {
    const { page = '1', limit = '10', statusId, leaveTypeId, startDate, endDate } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { employeeId, isActive: true };
    if (statusId) where.statusId = Number(statusId);
    if (leaveTypeId) where.leaveTypeId = Number(leaveTypeId);
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.startDate.lte = end;
      }
    }

    const [leaves, total] = await Promise.all([
      this.prisma.leave.findMany({
        where,
        include: { leaveType: true, status: true },
        skip,
        take: Number(limit),
        orderBy: [{ createdAt: 'desc' }],
      }),
      this.prisma.leave.count({ where }),
    ]);

    const stats = await this.prisma.leave.groupBy({
      by: ['statusId'],
      where: { employeeId, isActive: true },
      _count: true,
      _sum: { totalDays: true },
    });

    const pendingStat = stats.find((s) => s.statusId === 1);
    const approvedStat = stats.find((s) => s.statusId === 2);

    return {
      success: true,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      data: leaves,
      stats: {
        pendingCount: pendingStat?._count ?? 0,
        approvedCount: approvedStat?._count ?? 0,
        approvedDays: approvedStat?._sum?.totalDays ?? 0,
      },
    };
  }

  async findAll(query: GetLeaveDto) {
    const {
      page = '1',
      limit = '10',
      statusId,
      leaveTypeId,
      employeeId,
      employeeName,
      employeeEmail,
      startDate,
      endDate,
    } = query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { isActive: true };

    if (employeeId) where.employeeId = employeeId;
    if (statusId) where.statusId = Number(statusId);
    if (leaveTypeId) where.leaveTypeId = Number(leaveTypeId);

    if (employeeName || employeeEmail) {
      where.employee = {};
      if (employeeName) {
        where.employee.OR = [
          { firstName: { contains: employeeName, mode: 'insensitive' } },
          { lastName: { contains: employeeName, mode: 'insensitive' } },
        ];
      }
      if (employeeEmail) {
        where.employee.email = { contains: employeeEmail, mode: 'insensitive' };
      }
    }

    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.startDate.lte = end;
      }
    }

    const [leaves, total] = await Promise.all([
      this.prisma.leave.findMany({
        where,
        include: {
          leaveType: true,
          status: true,
          employee: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          approvedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        skip,
        take: Number(limit),
        orderBy: [{ createdAt: 'desc' }],
      }),
      this.prisma.leave.count({ where }),
    ]);

    return {
      success: true,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      data: leaves,
    };
  }

  async updateStatus(id: string, adminId: string, dto: UpdateLeaveStatusDto) {
    const leave = await this.prisma.leave.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException('Leave request not found');

    const status = await this.prisma.leaveStatus.findUnique({
      where: { id: dto.statusId },
    });
    if (!status) throw new BadRequestException('Invalid status');

    const updated = await this.prisma.leave.update({
      where: { id },
      data: {
        statusId: dto.statusId,
        approvedById: adminId,
        rejectionReason: dto.statusId === 3 ? dto.rejectionReason : null,
      },
      include: { leaveType: true, status: true, employee: true, approvedBy: true },
    });

    const statusLabel = dto.statusId === 2 ? 'approved' : 'rejected';
    await this.notificationService.create(
      updated.employeeId,
      `Leave Request ${statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}`,
      `Your ${updated.leaveType.name} leave request has been ${statusLabel}`,
      `leave_${statusLabel}`,
      { leaveId: id },
    );

    return {
      success: true,
      message: `Leave request ${statusLabel} successfully`,
      data: updated,
    };
  }

  async getLeaveTypes() {
    const types = await this.prisma.leaveType.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    });
    return { success: true, data: types };
  }
}
