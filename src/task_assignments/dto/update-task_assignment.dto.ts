import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskAssignmentDto } from './create-task_assignment.dto.js';

export class UpdateTaskAssignmentDto extends PartialType(CreateTaskAssignmentDto) {}
