import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { GetTimeEntryDto } from './dto/get-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { UpdateTimeEntryStatusDto } from './dto/update-time-entry-status.dto';

@Injectable()
export class TimeEntryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  private parseTimeToMinutes(
    time: string,
  ): number {
    const [hours, minutes] = time
      .split(':')
      .map(Number);

    return hours * 60 + minutes;
  }

  async create(
    employeeId: string,
    dto: CreateTimeEntryDto,
  ) {
    const {
      date,
      startTime,
      endTime,
      breakDuration = 0,
      notes,
    } = dto;

    const startMinutes =
      this.parseTimeToMinutes(startTime);

    let endMinutes =
      this.parseTimeToMinutes(endTime);

    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }

    const duration =
      endMinutes -
      startMinutes -
      breakDuration;

    if (duration < 0) {
      throw new BadRequestException(
        'Break duration cannot exceed total work duration',
      );
    }

    const existingEntry =
      await this.prisma.timeEntry.findFirst({
        where: {
          employeeId,
          date: new Date(date),
          isActive: true,
        },
      });

    if (existingEntry) {
      throw new BadRequestException(
        'Time entry already exists for this date',
      );
    }

    const timeEntry =
      await this.prisma.timeEntry.create({
        data: {
          employeeId,
          date: new Date(date),
          startTime,
          endTime,
          breakDuration,
          notes,
          duration,
          statusId: 1,
        },
        include: {
          status: true,
          employee: { select: { firstName: true, lastName: true } },
        },
      });

    const emp = (timeEntry as any).employee;
    const empName = emp
      ? `${emp.firstName} ${emp.lastName}`
      : 'An employee';
    const dateLabel = new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    this.notificationService.notifyAllAdmins(
      'New Time Entry Submitted',
      `${empName} submitted a time entry for ${dateLabel}.`,
      'time_entry_submitted',
      { timeEntryId: timeEntry.id },
    );

    return {
      success: true,
      message:
        'Time entry submitted successfully',
      data: timeEntry,
    };
  }

  async getMyEntries(
    employeeId: string,
    query: GetTimeEntryDto,
  ) {
    const {
      page = '1',
      limit = '10',
      statusId,
      startDate,
      endDate,
    } = query;

    const skip =
      (Number(page) - 1) *
      Number(limit);

    const where: any = {
      employeeId,
      isActive: true,
    };

    if (statusId) {
      where.statusId =
        Number(statusId);
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const [entries, total] =
      await Promise.all([
        this.prisma.timeEntry.findMany({
          where,
          include: {
            status: true,
          },
          skip,
          take: Number(limit),
          orderBy: [
            {
              date: 'desc',
            },
            {
              createdAt: 'desc',
            },
          ],
        }),

        this.prisma.timeEntry.count({
          where,
        }),
      ]);

    const pendingStats =
      await this.prisma.timeEntry.aggregate({
        where: {
          employeeId,
          statusId: 1,
          isActive: true,
        },
        _sum: {
          duration: true,
        },
      });

    const startOfMonth =
      new Date();

    startOfMonth.setDate(1);
    startOfMonth.setHours(
      0,
      0,
      0,
      0,
    );

    const approvedStats =
      await this.prisma.timeEntry.aggregate({
        where: {
          employeeId,
          statusId: 2,
          isActive: true,
          date: {
            gte: startOfMonth,
          },
        },
        _sum: {
          duration: true,
        },
      });

    return {
      success: true,

      page: Number(page),

      limit: Number(limit),

      total,

      totalPages: Math.ceil(
        total /
          Number(limit),
      ),

      data: entries,

      stats: {
        pendingHours: Number(
          (
            (pendingStats._sum
              .duration || 0) / 60
          ).toFixed(2),
        ),

        approvedHours: Number(
          (
            (approvedStats._sum
              .duration || 0) / 60
          ).toFixed(2),
        ),
      },
    };
  }

  async findAll(
    query: GetTimeEntryDto,
  ) {
    const {
      page = '1',
      limit = '10',
      employeeId,
      statusId,
      employeeName,
      employeeEmail,
      startDate,
      endDate,
    } = query;

    const skip =
      (Number(page) - 1) *
      Number(limit);

    const where: any = {
      isActive: true,
    };

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (statusId) {
      where.statusId = Number(statusId);
    }

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
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const [entries, total] =
      await Promise.all([
        this.prisma.timeEntry.findMany({
          where,

          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },

            approvedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },

            status: true,
          },

          skip,

          take: Number(limit),

          orderBy: [
            {
              date: 'desc',
            },
            {
              createdAt: 'desc',
            },
          ],
        }),

        this.prisma.timeEntry.count({
          where,
        }),
      ]);

    return {
      success: true,

      page: Number(page),

      limit: Number(limit),

      total,

      totalPages: Math.ceil(
        total /
          Number(limit),
      ),

      data: entries,
    };
  }

  async findOne(id: string, employeeId: string) {
    const entry = await this.prisma.timeEntry.findFirst({
      where: { id, employeeId, isActive: true },
      include: { status: true },
    });

    if (!entry) {
      throw new NotFoundException('Time entry not found');
    }

    return { success: true, data: entry };
  }

  async resubmit(
    id: string,
    employeeId: string,
    dto: UpdateTimeEntryDto,
  ) {
    const entry = await this.prisma.timeEntry.findFirst({
      where: { id, employeeId, isActive: true },
    });

    if (!entry) {
      throw new NotFoundException('Time entry not found');
    }

    if (entry.statusId !== 3) {
      throw new BadRequestException(
        'Only rejected time entries can be resubmitted',
      );
    }

    const {
      date,
      startTime = entry.startTime,
      endTime = entry.endTime,
      breakDuration = entry.breakDuration,
      notes,
    } = dto;

    const startMinutes = this.parseTimeToMinutes(startTime);
    let endMinutes = this.parseTimeToMinutes(endTime);
    if (endMinutes < startMinutes) endMinutes += 24 * 60;
    const duration = endMinutes - startMinutes - (breakDuration ?? 0);

    if (duration < 0) {
      throw new BadRequestException(
        'Break duration cannot exceed total work duration',
      );
    }

    const updated = await this.prisma.timeEntry.update({
      where: { id },
      data: {
        date: date ? new Date(date) : entry.date,
        startTime,
        endTime,
        breakDuration: breakDuration ?? entry.breakDuration,
        notes,
        duration,
        statusId: 1,
        rejectionReason: null,
        approvedById: null,
      },
      include: {
        status: true,
        employee: { select: { firstName: true, lastName: true } },
      },
    });

    const emp = (updated as any).employee;
    const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'An employee';
    const dateLabel = new Date(updated.date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    this.notificationService.notifyAllAdmins(
      'Time Entry Resubmitted',
      `${empName} resubmitted a time entry for ${dateLabel}.`,
      'time_entry_resubmitted',
      { timeEntryId: updated.id },
    );

    return {
      success: true,
      message: 'Time entry resubmitted successfully',
      data: updated,
    };
  }

  async updateStatus(
    id: string,
    adminId: string,
    dto: UpdateTimeEntryStatusDto,
  ) {
    const entry =
      await this.prisma.timeEntry.findUnique({
        where: {
          id,
        },
      });

    if (!entry) {
      throw new NotFoundException(
        'Time entry not found',
      );
    }

    const status =
      await this.prisma.timeEntryStatus.findUnique({
        where: {
          id: dto.statusId,
        },
      });

    if (!status) {
      throw new BadRequestException(
        'Invalid status',
      );
    }

    const updatedEntry =
      await this.prisma.timeEntry.update({
        where: {
          id,
        },

        data: {
          statusId:
            dto.statusId,

          approvedById:
            adminId,

          rejectionReason:
            dto.statusId === 3
              ? dto.rejectionReason
              : null,
        },

        include: {
          employee: true,
          approvedBy: true,
          status: true,
        },
      });

    const dateLabel = new Date(
      updatedEntry.date,
    ).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    if (dto.statusId === 2) {
      this.notificationService.create(
        updatedEntry.employeeId,
        'Time Entry Approved',
        `Your time entry for ${dateLabel} has been approved.`,
        'time_entry_approved',
        { timeEntryId: updatedEntry.id },
      );
    } else if (dto.statusId === 3) {
      const reason = dto.rejectionReason
        ? ` Reason: ${dto.rejectionReason}`
        : '';
      this.notificationService.create(
        updatedEntry.employeeId,
        'Time Entry Rejected',
        `Your time entry for ${dateLabel} has been rejected.${reason}`,
        'time_entry_rejected',
        { timeEntryId: updatedEntry.id },
      );
    }

    return {
      success: true,
      message:
        'Time entry status updated successfully',
      data: updatedEntry,
    };
  }
}