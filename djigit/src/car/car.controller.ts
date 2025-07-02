import { Controller, Post, Body, UseGuards, Request, Patch, Param, ParseIntPipe, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CarService } from './car.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

@Controller('car')
export class CarController {
    constructor(private carService: CarService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async addCar(@Body() carDto: CreateCarDto, @Request() req) {
    return this.carService.addCar(carDto, req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async updateCar(
    @Param('id', ParseIntPipe) carId: number,
    @Body() updateDto: UpdateCarDto,
    @Request() req,
    ) {
    return this.carService.updateCar(carId, updateDto, req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteCar(
    @Param('id', ParseIntPipe) carId: number,
    @Request() req,
    ) {
    return this.carService.deleteCar(carId, req.user);
    }
}
