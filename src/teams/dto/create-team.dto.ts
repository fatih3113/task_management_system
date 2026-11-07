import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama tim tidak boleh kosong' })
  @MaxLength(100, { message: 'Nama tim maksimal 100 karakter' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

