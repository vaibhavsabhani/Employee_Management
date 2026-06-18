import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedRoles() {
  await prisma.role.createMany({
    data: [
      {
        name: 'admin',
      },
      {
        name: 'employee',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Roles seeded');
}