import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedSuperAdmin() {
  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'super_admin' },
  });

  if (!superAdminRole) {
    throw new Error('super_admin role not found');
  }

  const existing = await prisma.user.findUnique({
    where: { email: 'vaibhavsabhan.prolix@gmail.com' },
  });

  if (existing) {
    console.log('✅ Super admin already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('SuperAdmin@123', 10);

  await prisma.user.create({
    data: {
      firstName: 'Vaibhav',
      lastName: 'Sabhani',
      email: 'vaibhavsabhan.prolix@gmail.com',
      password: hashedPassword,
      roleId: superAdminRole.id,
      isActive: true,
    },
  });

  console.log('✅ Super admin seeded');
}
