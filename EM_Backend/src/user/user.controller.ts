import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UserGuard } from '../auth/guards/user.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, UserGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Post()
  @Roles('admin')
  create(
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.userService.create(
      createUserDto,
    );
  }

  @Get()
  @Roles('admin')
  findAll(
    @Query() query: GetUsersDto,
  ) {
    return this.userService.findAll(
      query,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(
      id,
      updateUserDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.userService.remove(id);
  }
}