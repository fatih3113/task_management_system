import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskAssignment } from './entities/task_assignment.entity.js';
import { TaskAssignmentsService } from './task_assignments.service.js';
import { TaskAssignmentsController } from './task_assignments.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([TaskAssignment])],
  controllers: [TaskAssignmentsController],
  providers: [TaskAssignmentsService],
  exports: [TaskAssignmentsService],
})
export class TaskAssignmentsModule {}