import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaskAssignmentDto {
  @IsNotEmpty()
  @IsInt()
  taskId: number;

  @IsNotEmpty()
  @IsInt()
  memberId: number;
}

export class FindTaskAssignmentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  taskId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  memberId?: number;
}