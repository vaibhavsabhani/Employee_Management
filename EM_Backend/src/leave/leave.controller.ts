import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserGuard } from '../auth/guards/user.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { GetLeaveDto } from './dto/get-leave.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';

@ApiTags('Leaves')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, UserGuard)
@Controller('leaves')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @ApiOperation({ summary: 'Get all leave types' })
  @Get('types')
  getLeaveTypes() {
    return this.leaveService.getLeaveTypes();
  }

  @ApiOperation({ summary: 'Apply for leave' })
  @Post()
  @Roles('employee')
  create(@Request() req, @Body() dto: CreateLeaveDto) {
    return this.leaveService.create(req.user.id, dto);
  }

  @ApiOperation({ summary: 'My leave requests' })
  @Get('me')
  getMyLeaves(@Request() req, @Query() query: GetLeaveDto) {
    return this.leaveService.getMyLeaves(req.user.id, query);
  }

  @ApiOperation({ summary: 'All leave requests (admin)' })
  @Get()
  findAll(@Query() query: GetLeaveDto) {
    return this.leaveService.findAll(query);
  }

  @ApiOperation({ summary: 'Approve / Reject leave' })
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateLeaveStatusDto,
  ) {
    return this.leaveService.updateStatus(id, req.user.id, dto);
  }
}
