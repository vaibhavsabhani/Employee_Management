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
import { PunchDto, PunchAction } from './dto/punch.dto';

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

  /** Current wall-clock time as a "HH:mm" string (server local time). */
  private nowHHmm(now: Date): string {
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  /** Start of today (server local time) used as the entry `date`. */
  private todayStart(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /** Today's date as "YYYY-MM-DD" (server local time). */
  private todayDateStr(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /** The employee's approved leave covering today, if any. */
  private async todayApprovedLeave(employeeId: string) {
    const dateStr = this.todayDateStr();
    return this.prisma.leave.findFirst({
      where: {
        employeeId,
        statusId: 2, // approved
        isActive: true,
        startDate: { lte: new Date(`${dateStr}T23:59:59.999Z`) },
        endDate: { gte: new Date(`${dateStr}T00:00:00.000Z`) },
      },
      include: { leaveType: true },
    });
  }

  /** Find today's punch entry for an employee, if any. */
  private async findTodayEntry(employeeId: string) {
    const start = this.todayStart();
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    return this.prisma.timeEntry.findFirst({
      where: {
        employeeId,
        isActive: true,
        date: { gte: start, lte: end },
      },
      include: { status: true },
    });
  }

  /** Whole minutes between two timestamps (never negative). */
  private minutesBetween(from: Date, to: Date): number {
    return Math.max(0, Math.round((to.getTime() - from.getTime()) / 60000));
  }

  /** Display name from an entry that includes the employee relation. */
  private employeeName(entry: any): string {
    const e = entry?.employee;
    return e ? `${e.firstName} ${e.lastName}` : 'An employee';
  }

  /** Notify all admins of a punch event (fire-and-forget). */
  private notifyPunch(
    entry: any,
    title: string,
    message: string,
    type: string,
  ) {
    this.notificationService.notifyAllAdmins(title, message, type, {
      timeEntryId: entry.id,
      employeeId: entry.employeeId,
    });
  }

  /** Today's punch entry plus a derived state for the UI. */
  async getActive(employeeId: string) {
    const entry = await this.findTodayEntry(employeeId);

    let state:
      | 'not_clocked_in'
      | 'working'
      | 'on_lunch'
      | 'completed' = 'not_clocked_in';

    if (entry) {
      if (entry.endTime) state = 'completed';
      else if (entry.lunchOutAt && !entry.lunchInAt) state = 'on_lunch';
      else state = 'working';
    }

    const leave = await this.todayApprovedLeave(employeeId);

    return { success: true, state, data: entry, leave };
  }

  /** Single entry point for all punch-clock actions. */
  async punch(employeeId: string, dto: PunchDto) {
    switch (dto.action) {
      case PunchAction.CLOCK_IN:
        return this.clockIn(employeeId);
      case PunchAction.LUNCH_START:
        return this.lunchStart(employeeId);
      case PunchAction.LUNCH_END:
        return this.lunchEnd(employeeId);
      case PunchAction.CLOCK_OUT:
        if (!dto.notes || !dto.notes.trim()) {
          throw new BadRequestException(
            'Work notes are required to clock out',
          );
        }
        return this.clockOut(employeeId, dto.notes.trim());
      default:
        throw new BadRequestException('Invalid punch action');
    }
  }

  /** Clock in — creates today's entry. One per day. */
  private async clockIn(employeeId: string) {
    const existing = await this.findTodayEntry(employeeId);
    if (existing) {
      throw new BadRequestException(
        'You have already clocked in today',
      );
    }

    const dateStr = this.todayDateStr();
    const dayStart = new Date(`${dateStr}T00:00:00.000Z`);

    // Block clock-in when on approved leave today — unless it's a half day.
    const leave = await this.todayApprovedLeave(employeeId);
    if (leave && !leave.isHalfDay) {
      throw new BadRequestException(
        'You are on approved leave today and cannot clock in.',
      );
    }

    const now = new Date();
    const entry = await this.prisma.timeEntry.create({
      data: {
        employeeId,
        date: this.todayStart(),
        startTime: this.nowHHmm(now),
        endTime: null,
        breakDuration: 0,
        duration: 0,
        statusId: 1,
      },
      include: {
        status: true,
        employee: { select: { firstName: true, lastName: true } },
      },
    });

    // Automatically mark the employee Present for today.
    await this.prisma.attendance.upsert({
      where: {
        employeeId_date: { employeeId, date: dayStart },
      },
      create: {
        employeeId,
        date: dayStart,
        statusId: 1, // Present
        notes: 'Auto-marked via clock-in',
      },
      update: { statusId: 1 },
    });

    this.notifyPunch(
      entry,
      'Employee Clocked In',
      `${this.employeeName(entry)} clocked in at ${entry.startTime}.`,
      'time_entry_clock_in',
    );

    return { success: true, message: 'Clocked in', data: entry };
  }

  /** Leaving for lunch — marks the start of the (single) lunch break. */
  private async lunchStart(employeeId: string) {
    const entry = await this.findTodayEntry(employeeId);
    if (!entry) {
      throw new BadRequestException('You need to clock in first');
    }
    if (entry.endTime) {
      throw new BadRequestException('You have already clocked out today');
    }
    if (entry.lunchOutAt) {
      throw new BadRequestException('Lunch break has already been taken');
    }

    const lunchOut = new Date();
    const updated = await this.prisma.timeEntry.update({
      where: { id: entry.id },
      data: { lunchOutAt: lunchOut },
      include: {
        status: true,
        employee: { select: { firstName: true, lastName: true } },
      },
    });

    this.notifyPunch(
      updated,
      'Employee On Lunch Break',
      `${this.employeeName(updated)} left for lunch at ${this.nowHHmm(lunchOut)}.`,
      'time_entry_lunch_start',
    );

    return { success: true, message: 'Lunch started', data: updated };
  }

  /** Back from lunch — ends the lunch break and stores its duration. */
  private async lunchEnd(employeeId: string) {
    const entry = await this.findTodayEntry(employeeId);
    if (!entry) {
      throw new BadRequestException('You need to clock in first');
    }
    if (entry.endTime) {
      throw new BadRequestException('You have already clocked out today');
    }
    if (!entry.lunchOutAt) {
      throw new BadRequestException('You are not on a lunch break');
    }
    if (entry.lunchInAt) {
      throw new BadRequestException('You are already back from lunch');
    }

    const lunchIn = new Date();
    const breakDuration = this.minutesBetween(entry.lunchOutAt, lunchIn);

    const updated = await this.prisma.timeEntry.update({
      where: { id: entry.id },
      data: { lunchInAt: lunchIn, breakDuration },
      include: {
        status: true,
        employee: { select: { firstName: true, lastName: true } },
      },
    });

    this.notifyPunch(
      updated,
      'Employee Back from Lunch',
      `${this.employeeName(updated)} returned from lunch at ${this.nowHHmm(
        lunchIn,
      )} (${breakDuration} min break).`,
      'time_entry_lunch_end',
    );

    return { success: true, message: 'Back from lunch', data: updated };
  }

  /** Clock out — finalises the entry and auto-approves it. */
  private async clockOut(employeeId: string, notes: string) {
    const entry = await this.findTodayEntry(employeeId);
    if (!entry) {
      throw new BadRequestException('You need to clock in first');
    }
    if (entry.endTime) {
      throw new BadRequestException('You have already clocked out today');
    }

    const now = new Date();

    // If they clock out while still on lunch, close the lunch break first.
    let breakDuration = entry.breakDuration;
    let lunchInAt = entry.lunchInAt;
    if (entry.lunchOutAt && !entry.lunchInAt) {
      lunchInAt = now;
      breakDuration = this.minutesBetween(entry.lunchOutAt, now);
    }

    const startMinutes = this.parseTimeToMinutes(entry.startTime);
    let endMinutes = this.parseTimeToMinutes(this.nowHHmm(now));
    if (endMinutes < startMinutes) endMinutes += 24 * 60;

    const duration = Math.max(0, endMinutes - startMinutes - breakDuration);

    const updated = await this.prisma.timeEntry.update({
      where: { id: entry.id },
      data: {
        endTime: this.nowHHmm(now),
        lunchInAt,
        breakDuration,
        duration,
        notes,
        statusId: 2, // auto-approved
      },
      include: {
        status: true,
        employee: { select: { firstName: true, lastName: true } },
      },
    });

    const hours = (duration / 60).toFixed(1);
    this.notifyPunch(
      updated,
      'Employee Clocked Out',
      `${this.employeeName(updated)} clocked out at ${updated.endTime}. Worked ${hours}h.`,
      'time_entry_clock_out',
    );

    return {
      success: true,
      message: 'Clocked out. Have a great day!',
      data: updated,
    };
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
      // Hide in-progress entries (clocked in but not yet clocked out) from
      // admin review — only finalised entries should be approvable.
      endTime: { not: null },
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
      endTime = entry.endTime ?? '',
      breakDuration = entry.breakDuration,
      notes,
    } = dto;

    if (!endTime) {
      throw new BadRequestException('End time is required');
    }

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