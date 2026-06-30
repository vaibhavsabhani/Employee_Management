import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserGuard } from '../auth/guards/user.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AttendanceService } from './attendance.service';
import { GetAttendanceDto } from './dto/get-attendance.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, UserGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @ApiOperation({ summary: 'My attendance history (employee)' })
  @Get('me')
  @Roles('employee')
  getMyAttendance(@Request() req, @Query('month') month?: string) {
    return this.attendanceService.getMyAttendance(req.user.id, { month });
  }

  @ApiOperation({ summary: 'Get date-wise attendance for all employees (admin)' })
  @Get()
  @Roles('admin')
  getAttendance(@Query() query: GetAttendanceDto) {
    return this.attendanceService.getAttendance(query);
  }

  @ApiOperation({ summary: 'Mark employee attendance (admin)' })
  @Post('mark')
  @Roles('admin')
  markAttendance(@Request() req, @Body() dto: MarkAttendanceDto) {
    return this.attendanceService.markAttendance(
      req.user.id,
      req.user.role?.name,
      dto,
    );
  }
}
