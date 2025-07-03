import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCarDto {
  @ApiProperty({ example: 'Toyota', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ example: 'Corolla', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ example: 'ABC123', required: false })
  @IsOptional()
  @IsString()
  licensePlate?: string;
}
