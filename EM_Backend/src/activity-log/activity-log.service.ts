import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetLogsDto } from './dto/get-logs.dto';

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetLogsDto) {
    const {
      offset = '0',
      limit = '10',
      search,
      email,
      action,
      startDate,
      endDate,
    } = query;

    const skip = Number(offset);

    const where: any = {};

    if (action) {
      where.action = action.toUpperCase();
    }

    if (startDate || endDate) {
      where.loginAt = {};
      if (startDate) where.loginAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.loginAt.lte = end;
      }
    }

    if (search || email) {
      where.user = {
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(email && { email: { contains: email, mode: 'insensitive' } }),
      };
    }

    const [logs, total] = await Promise.all([
      this.prisma.userActivityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profilePicture: true,
              role: { select: { name: true } },
            },
          },
        },
        skip,
        take: Number(limit),
        orderBy: { loginAt: 'desc' },
      }),
      this.prisma.userActivityLog.count({ where }),
    ]);

    return {
      success: true,
      total,
      offset: skip,
      limit: Number(limit),
      data: logs,
    };
  }
}
