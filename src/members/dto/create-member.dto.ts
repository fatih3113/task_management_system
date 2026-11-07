import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const trimLower = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class CreateMemberDto {
  @Type(() => Number)
  @IsInt({ message: 'teamId harus berupa angka' })
  @IsPositive({ message: 'teamId harus berupa angka positif' })
  teamId: number;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Nama anggota tidak boleh kosong' })
  @MaxLength(100, { message: 'Nama anggota maksimal 100 karakter' })
  name: string;

  @Transform(trimLower)
  @IsEmail({}, { message: 'Format email tidak valid' })
  @MaxLength(150, { message: 'Email maksimal 150 karakter' })
  email: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Role anggota tidak boleh kosong' })
  @MaxLength(50, { message: 'Role anggota maksimal 50 karakter' })
  role: string;
}

export class FindMembersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'teamId harus berupa angka' })
  @IsPositive({ message: 'teamId harus berupa angka positif' })
  teamId?: number;
}
