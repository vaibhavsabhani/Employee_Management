import { Module } from '@nestjs/common';

import { NotificationModule } from '../notification/notification.module';

import { TimeEntryController } from './time-entry.controller';
import { TimeEntryService } from './time-entry.service';

@Module({
  imports: [NotificationModule],
  controllers: [TimeEntryController],
  providers: [TimeEntryService],
})
export class TimeEntryModule {}