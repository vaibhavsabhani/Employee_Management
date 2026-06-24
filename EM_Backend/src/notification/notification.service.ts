import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationGateway,
  ) {}

  async create(
    userId: string,
    title: string,
    message: string,
    type: string,
    data?: Record<string, any>,
  ) {
    const notification = await this.prisma.notification.create({
      data: { userId, title, message, type, data },
    });
    this.gateway.sendToUser(userId, notification);
    return notification;
  }

  async notifyAllAdmins(
    title: string,
    message: string,
    type: string,
    data?: Record<string, any>,
  ) {
    const adminRole = await this.prisma.role.findUnique({
      where: { name: 'admin' },
    });
    if (!adminRole) return;
    const admins = await this.prisma.user.findMany({
      where: { isActive: true, roleId: adminRole.id },
      select: { id: true },
    });
    await Promise.all(
      admins.map((a) => this.create(a.id, title, message, type, data)),
    );
  }

  async getForUser(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return {
      success: true,
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    };
  }

  async markRead(id: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    return { success: true };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }
}
