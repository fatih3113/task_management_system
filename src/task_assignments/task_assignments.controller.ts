import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { TaskAssignmentsService } from './task_assignments.service.js';
import {
  CreateTaskAssignmentDto,
  FindTaskAssignmentsQueryDto,
} from './dto/create-task_assignment.dto.js';
import { TaskAssignment } from './entities/task_assignment.entity.js';

@Controller('task-assignments')
export class TaskAssignmentsController {
  constructor(
    private readonly taskAssignmentsService: TaskAssignmentsService,
  ) {}

  @Get()
  findAll(
    @Query() query: FindTaskAssignmentsQueryDto,
  ): Promise<TaskAssignment[]> {
    return this.taskAssignmentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<TaskAssignment> {
    return this.taskAssignmentsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createTaskAssignmentDto: CreateTaskAssignmentDto,
  ): Promise<TaskAssignment> {
    return this.taskAssignmentsService.create(createTaskAssignmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.taskAssignmentsService.remove(id);
  }
}