import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO untuk query parameter GET /books/search
 */
export class SearchBooksDto {
  @ApiProperty({ description: 'Query pencarian (judul, penulis, ISBN)', example: 'harry potter' })
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  q: string;

  @ApiPropertyOptional({ description: 'Filter bahasa (kode ISO 639-1)', example: 'id' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.toLowerCase())
  lang?: string;

  @ApiPropertyOptional({ description: 'Nomor halaman', default: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Jumlah item per halaman', default: 12, minimum: 1, maximum: 40 })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(40)
  pageSize?: number = 12;
}

/**
 * DTO untuk parameter GET /books/:id
 */
export class GetBookByIdDto {
  @ApiProperty({ description: 'ID buku dari Google Books', example: 'abc123' })
  @IsString()
  id: string;
}