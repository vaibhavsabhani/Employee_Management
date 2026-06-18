import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { GetTimeEntryDto } from './dto/get-time-entry.dto';
import { UpdateTimeEntryStatusDto } from './dto/update-time-entry-status.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';

@Injectable()
export class TimeEntryService {
  constructor(
    private readonly prisma: PrismaService,
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
        },
      });

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
    } = query;

    const skip =
      (Number(page) - 1) *
      Number(limit);

    const where: any = {
      isActive: true,
    };

    if (employeeId) {
      where.employeeId =
        employeeId;
    }

    if (statusId) {
      where.statusId =
        Number(statusId);
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

    return {
      success: true,
      message:
        'Time entry status updated successfully',
      data: updatedEntry,
    };
  }
}