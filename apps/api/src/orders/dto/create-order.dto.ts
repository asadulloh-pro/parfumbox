import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderLineDto {
  @IsString()
  productId: string;

  @Type(() => Number)
  @Min(1)
  quantity: number;
}

export enum PaymentMethodDto {
  cod = 'cod',
  bank_transfer = 'bank_transfer',
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderLineDto)
  items: OrderLineDto[];

  @IsEnum(PaymentMethodDto)
  paymentMethod: PaymentMethodDto;

  @IsString()
  deliveryPhone: string;

  @IsString()
  deliveryAddress: string;

  @IsOptional()
  @IsString()
  deliveryComment?: string;
}
