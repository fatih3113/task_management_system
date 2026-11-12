import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsString({ message: 'Status proyek harus berupa teks' })
  @IsNotEmpty({ message: 'Status proyek tidak boleh kosong' })
  @MaxLength(20, { message: 'Status proyek maksimal 20 karakter' })
  status: string;

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
  @IsString()
  @MaxLength(20, { message: 'Status proyek maksimal 20 karakter' })
  status?: string;
}