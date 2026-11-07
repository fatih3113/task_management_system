import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { CreateTaskDto, TASK_STATUSES } from './create-task.dto.js';

export class UpdateTaskDto extends PartialType(
  OmitType(CreateTaskDto, ['projectId'] as const),
) {
  @IsOptional()
  @IsIn(TASK_STATUSES, {
    message: `status harus salah satu dari: ${TASK_STATUSES.join(', ')}`,
  })
  status?: string;
}
