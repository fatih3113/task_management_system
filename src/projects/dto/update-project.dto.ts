import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { CreateProjectDto, PROJECT_STATUSES } from './create-project.dto.js';

export class UpdateProjectDto extends PartialType(
  OmitType(CreateProjectDto, ['teamId'] as const),
) {
  @IsOptional()
  @IsIn(PROJECT_STATUSES, {
    message: `status harus salah satu dari: ${PROJECT_STATUSES.join(', ')}`,
  })
  status?: string;
}

