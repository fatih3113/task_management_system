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

export const PROJECT_STATUSES = ['active', 'on_hold', 'completed'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export class CreateProjectDto {
  @Type(() => Number)
  @IsInt({ message: 'teamId harus berupa angka' })
  @IsPositive({ message: 'teamId harus berupa angka positif' })
  teamId: number;

  @IsString()
  @IsNotEmpty({ message: 'Nama proyek tidak boleh kosong' })
  @MaxLength(150, { message: 'Nama proyek maksimal 150 karakter' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: 'startDate harus berformat YYYY-MM-DD' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'endDate harus berformat YYYY-MM-DD' })
  endDate?: string;
}

export class FindProjectsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  teamId?: number;

  @IsOptional()
  @IsIn(PROJECT_STATUSES, {
    message: `status harus salah satu dari: ${PROJECT_STATUSES.join(', ')}`,
  })
  status?: string;
}
