import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product title',
    nullable: false,
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({
    required: false,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    required: false,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  sizes: string[];

  @ApiProperty()
  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
