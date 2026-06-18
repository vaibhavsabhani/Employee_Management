import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedTimeEntryStatuses() {
  await prisma.timeEntryStatus.createMany({
    data: [
      {
        id: 1,
        name: 'Pending',
      },
      {
        id: 2,
        name: 'Approved',
      },
      {
        id: 3,
        name: 'Rejected',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Time Entry Statuses seeded');
}