import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'Get profile with user details, cars, and reports' })
  @ApiOkResponse({ description: 'Profile data', schema: { example: {
    id: 1,
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    cars: [
      { id: 1, brand: 'Toyota', model: 'Corolla', licensePlate: 'ABC123' }
    ],
    reports: [
      {
        id: 1,
        licensePlate: 'XYZ789',
        description: 'Report description',
        latitude: 40.7128,
        longitude: -74.0060,
        createdAt: '2024-05-01T12:00:00.000Z',
        imageUrl: 'https://example.com/image.jpg',
        videoUrl: null
      }
    ]
  } } })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT token missing or invalid.' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.userService.getProfile(req.user.userId);
  }
} 