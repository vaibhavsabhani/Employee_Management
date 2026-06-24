import { PrismaClient } from '@prisma/client';
import { seedAdmin } from './admin-seed';
import { seedRoles } from './role-seed';
import { seedTimeEntryStatuses } from './time-entry-status.seed';
import { seedLeaveTypes } from './leave-type.seed';
import { seedLeaveStatuses } from './leave-status.seed';
import { seedAttendanceStatuses } from './attendance-status.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Seeds...');

  await seedRoles();
  await seedAdmin();
  await seedTimeEntryStatuses();
  await seedLeaveTypes();
  await seedLeaveStatuses();
  await seedAttendanceStatuses();

  console.log('🎉 All Seeds Completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
