import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersDto } from './dto/get-users.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const {
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      roleId,
      profilePicture,
      address,
      panNumber,
      aadhaarNumber,
    } = createUserDto;

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const role = await this.prisma.role.findUnique({
      where: {
        id: roleId,
      },
    });

    if (!role) {
      throw new BadRequestException('Role not found');
    }

    const defaultPassword = 'Abcde@012024';

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        firstName: firstName.trim(),
        middleName: middleName?.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        password: hashedPassword,

        phoneNumber,
        profilePicture,

        address: address?.trim(),

        panNumber: panNumber?.toUpperCase(),

        aadhaarNumber,

        roleId,
      },
      include: {
        role: true,
      },
    });

    const { password, ...userResponse } = user;

    return {
      success: true,
      message: 'Employee added successfully',
      user: userResponse,
    };
  }

  async findAll(query: GetUsersDto) {
    const {
      offset = '0',
      limit = '10',
      search = '',
      roleId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = Number(offset);

    const where: any = {
      isActive: true,
    };

    if (roleId) {
      where.roleId = roleId;
    }

    if (search) {
      where.OR = [
        {
          firstName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          middleName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          panNumber: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          aadhaarNumber: {
            contains: search,
          },
        },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          role: true,
        },
        skip,
        take: Number(limit),
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),

      this.prisma.user.count({
        where,
      }),
    ]);

    return {
      success: true,
      offset: Number(offset),
      limit: Number(limit),
      total,
      users: users.map(({ password, ...user }) => user),
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        role: true,
      },
    });

    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userResponse } = user;

    return {
      success: true,
      user: userResponse,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        ...updateUserDto,
        email: updateUserDto.email?.toLowerCase().trim(),
      },
      include: {
        role: true,
      },
    });

    const { password, ...userResponse } = updatedUser;

    return {
      success: true,
      message: 'User updated successfully',
      user: userResponse,
    };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });

    return {
      success: true,
      message: 'User deactivated successfully',
    };
  }
}
