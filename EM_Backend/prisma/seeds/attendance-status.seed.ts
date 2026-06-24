import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedAttendanceStatuses() {
  await prisma.attendanceStatus.createMany({
    data: [
      { id: 1, name: 'Present' },
      { id: 2, name: 'Absent' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Attendance Statuses seeded');
}
