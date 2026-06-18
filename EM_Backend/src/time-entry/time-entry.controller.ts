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

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { TimeEntryService } from './time-entry.service';

import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { GetTimeEntryDto } from './dto/get-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { UpdateTimeEntryStatusDto } from './dto/update-time-entry-status.dto';

import { UserGuard } from '../auth/guards/user.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Time Entries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, UserGuard)
@Controller('time-entries')
export class TimeEntryController {
  constructor(
    private readonly timeEntryService: TimeEntryService,
  ) {}

  @ApiOperation({
    summary: 'Create Time Entry',
  })
  @Post()
  @Roles('employee')
  create(
    @Request() req,
    @Body() dto: CreateTimeEntryDto,
  ) {
    return this.timeEntryService.create(
      req.user.id,
      dto,
    );
  }

  @ApiOperation({
    summary: 'My Time Entries',
  })
  @Get('my')
  getMyEntries(
    @Request() req,
    @Query() query: GetTimeEntryDto,
  ) {
    return this.timeEntryService.getMyEntries(
      req.user.id,
      query,
    );
  }

  @ApiOperation({
    summary: 'All Time Entries',
  })
  @Get()
  findAll(
    @Query() query: GetTimeEntryDto,
  ) {
    return this.timeEntryService.findAll(
      query,
    );
  }

  @ApiOperation({
    summary: 'Approve / Reject Time Entry',
  })
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Request() req,
    @Body()
    dto: UpdateTimeEntryStatusDto,
  ) {
    return this.timeEntryService.updateStatus(
      id,
      req.user.id,
      dto,
    );
  }
}