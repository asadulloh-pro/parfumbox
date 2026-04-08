import { IsOptional, IsString, MinLength } from 'class-validator';

export class TelegramLoginDto {
  @IsString()
  @MinLength(10)
  initData: string;
}
