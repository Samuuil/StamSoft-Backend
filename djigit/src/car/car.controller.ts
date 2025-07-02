import { Controller, Post, Body, UseGuards, Request, Patch, Param, ParseIntPipe, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CarService } from './car.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('car')
@ApiBearerAuth()
@Controller('car')
export class CarController {
    constructor(private carService: CarService) {}

    @ApiOperation({ summary: 'Add a new car' })
    @ApiBody({ schema: { example: { brand: 'Toyota', model: 'Corolla', licensePlate: 'ABC123' }}})
    @ApiResponse({ status: 201, description: 'Car successfully created.' })
    @ApiResponse({ status: 400, description: 'Validation error.' })
    @ApiResponse({ status: 401, description: 'Unauthorized. JWT token missing or invalid.' })
    @UseGuards(JwtAuthGuard)
    @Post()
    async addCar(@Body() carDto: CreateCarDto, @Request() req) {
    return this.carService.addCar(carDto, req.user);
    }

    @ApiOperation({ summary: 'Update a car' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ schema: { example: { brand: 'Toyota', model: 'Corolla', licensePlate: 'XYZ789' }}})
    @ApiResponse({ status: 200, description: 'Car successfully updated.' })
    @ApiResponse({ status: 400, description: 'Validation error.' })
    @ApiResponse({ status: 401, description: 'Unauthorized. JWT token missing or invalid.' })
    @ApiResponse({ status: 403, description: 'Forbidden. You can only update your own car.' })
    @ApiResponse({ status: 404, description: 'Car not found.' })
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async updateCar(
    @Param('id', ParseIntPipe) carId: number,
    @Body() updateDto: UpdateCarDto,
    @Request() req,
    ) {
    return this.carService.updateCar(carId, updateDto, req.user);
    }

    @ApiOperation({ summary: 'Delete a car' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiResponse({ status: 200, description: 'Car successfully deleted.' })
    @ApiResponse({ status: 401, description: 'Unauthorized. JWT token missing or invalid.' })
    @ApiResponse({ status: 403, description: 'Forbidden. You can only delete your own car.' })
    @ApiResponse({ status: 404, description: 'Car not found.' })
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteCar(
    @Param('id', ParseIntPipe) carId: number,
    @Request() req,
    ) {
    return this.carService.deleteCar(carId, req.user);
    }
}
