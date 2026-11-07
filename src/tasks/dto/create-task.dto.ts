import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export const TASK_STATUSES = [
  'todo',
  'in_progress',
  'done',
  'cancelled',
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export class CreateTaskDto {
  @Type(() => Number)
  @IsInt({ message: 'projectId harus berupa angka' })
  @IsPositive({ message: 'projectId harus berupa angka positif' })
  projectId: number;

  @IsString()
  @IsNotEmpty({ message: 'Judul tugas tidak boleh kosong' })
  @MaxLength(200, { message: 'Judul tugas maksimal 200 karakter' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(TASK_PRIORITIES, {
    message: `priority harus salah satu dari: ${TASK_PRIORITIES.join(', ')}`,
  })
  priority?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dueDate harus berformat YYYY-MM-DD' })
  dueDate?: string;
}

export class FindTasksQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  projectId?: number;

  @IsOptional()
  @IsIn(TASK_STATUSES, {
    message: `status harus salah satu dari: ${TASK_STATUSES.join(', ')}`,
  })
  status?: string;

  @IsOptional()
  @IsIn(TASK_PRIORITIES, {
    message: `priority harus salah satu dari: ${TASK_PRIORITIES.join(', ')}`,
  })
  priority?: string;
}
