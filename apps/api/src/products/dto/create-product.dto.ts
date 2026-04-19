import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { ProductSizeLineDto } from "./product-size-line.dto";

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  description?: string;

  @ApiProperty({
    description: "Base price in UZS (integer). If `sizes` is set, server sets catalog `priceUzs` from 10 g if present, else minimum size price.",
  })
  @IsInt()
  @Min(0)
  priceUzs!: number;

  @ApiPropertyOptional({
    type: [ProductSizeLineDto],
    description: "Lines referencing ProductSizePreset ids with per-product prices.",
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductSizeLineDto)
  sizes?: ProductSizeLineDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: "Optional inventory; omit for untracked stock" })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}
