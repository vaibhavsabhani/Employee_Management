import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserGuard } from '../auth/guards/user.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActivityLogService } from './activity-log.service';
import { GetLogsDto } from './dto/get-logs.dto';

@ApiTags('Activity Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, UserGuard)
@Controller('activity-log')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all user login/logout activity logs (admin only)' })
  findAll(@Query() query: GetLogsDto) {
    return this.activityLogService.findAll(query);
  }
}
