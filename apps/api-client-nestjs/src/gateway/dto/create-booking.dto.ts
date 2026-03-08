import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ description: 'User ID reference', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID('4', { message: 'User must be a valid UUID' })
  user: string;

  @ApiProperty({ description: 'Parc ID reference', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty({ message: 'Parc ID is required' })
  @IsUUID('4', { message: 'Parc must be a valid UUID' })
  parc: string;

  @ApiProperty({ description: 'Booking date', example: '2024-07-15' })
  @IsNotEmpty({ message: 'Booking date is required' })
  @IsDateString({}, { message: 'Invalid date format (use ISO 8601)' })
  bookingdate: string;

  @ApiProperty({ description: 'Additional comments', example: 'Near the beach please', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comments?: string;
}
