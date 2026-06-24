import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedLeaveTypes() {
  await prisma.leaveType.createMany({
    data: [
      { id: 1, name: 'Sick Leave' },
      { id: 2, name: 'Casual Leave' },
      { id: 3, name: 'Annual Leave' },
      { id: 4, name: 'Unpaid Leave' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Leave Types seeded');
}
