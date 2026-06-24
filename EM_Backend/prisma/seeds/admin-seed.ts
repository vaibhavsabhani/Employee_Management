import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedAdmin() {
  const adminRole = await prisma.role.findUnique({
    where: {
      name: 'admin',
    },
  });

  if (!adminRole) {
    throw new Error('Admin role not found');
  }

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: 'priyanshmoghariya1124@gmail.com',
    },
  });

  if (existingAdmin) {
    console.log('✅ Admin already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  await prisma.user.create({
    data: {
      firstName: 'vaibhav',
      lastName: 'sabhani',
      email: 'priyanshmoghariya1124@gmail.com',
      password: hashedPassword,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  console.log('✅ Admin seeded');
}