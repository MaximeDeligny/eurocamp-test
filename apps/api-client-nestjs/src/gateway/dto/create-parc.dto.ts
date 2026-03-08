import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateParcDto {
  @ApiProperty({ description: 'Parc name', example: 'Camping Le Brasilia' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Parc description', example: 'Beautiful campsite in the south of France' })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  @MaxLength(1000)
  description: string;
}
