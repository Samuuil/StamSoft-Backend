import { Controller, Post, Body, UseGuards, Request, Patch, Param, ParseIntPipe, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CarService } from './car.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('car')
@ApiBearerAuth()
@Controller('car')
export class CarController {
    constructor(private carService: CarService) {}

    @ApiOperation({ summary: 'Add a new car' })
    @ApiBody({ schema: { example: { brand: 'Toyota', model: 'Corolla', licensePlate: 'ABC123' }}})
    @UseGuards(JwtAuthGuard)
    @Post()
    async addCar(@Body() carDto: CreateCarDto, @Request() req) {
    return this.carService.addCar(carDto, req.user);
    }

    @ApiOperation({ summary: 'Update a car' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ schema: { example: { brand: 'Toyota', model: 'Corolla', licensePlate: 'XYZ789' }}})
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
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteCar(
    @Param('id', ParseIntPipe) carId: number,
    @Request() req,
    ) {
    return this.carService.deleteCar(carId, req.user);
    }
}
