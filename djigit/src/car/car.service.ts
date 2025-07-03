import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from '../../typeorm/src/entity/car.entity';
import { Repository } from 'typeorm';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { User } from '../../typeorm/src/entity/user.entity';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car)
    private carRepo: Repository<Car>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async addCar(createCarDto: CreateCarDto, userPayload: { userId: number }) {
    const user = await this.userRepo.findOne({ where: { id: userPayload.userId } });
    if (!user) throw new NotFoundException('User not found');
    const existingCar = await this.carRepo.findOne({ where: { licensePlate: createCarDto.licensePlate } });

    if (existingCar && (existingCar.licensePlate != '' || existingCar.licensePlate != null)) {
        throw new BadRequestException('A car with this license plate already exists.');
    }
    const car = this.carRepo.create({
      ...createCarDto,
      owner: user,
    });
    try {
      const savedCar = await this.carRepo.save(car);
      if (savedCar.owner && typeof savedCar.owner === 'object') {
        (savedCar.owner as any).password = undefined;
      }
      return savedCar;
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('A car with this license plate already exists.');
      }
      throw error;
    }
  }

  async updateCar(carId: number, updateCarDto: UpdateCarDto, userPayload: { userId: number }) {
    const user = await this.userRepo.findOne({ where: { id: userPayload.userId } });
    if (!user) throw new NotFoundException('User not found');
    const car = await this.carRepo.findOne({ where: { id: carId }, relations: ['owner'] });

    if (!car) {
      throw new NotFoundException('Car not found with the provided ID.');
    }

    if (car.owner.id !== user.id) {
      throw new ForbiddenException('You can only update your own car.');
    }

    if (updateCarDto.licensePlate && updateCarDto.licensePlate !== car.licensePlate) {
      const existingCar = await this.carRepo.findOne({ where: { licensePlate: updateCarDto.licensePlate } });
      if (existingCar && (existingCar.licensePlate != '' || existingCar.licensePlate != null)) {
        throw new BadRequestException('A car with this license plate already exists.');
      }
    }

    Object.assign(car, updateCarDto);
    try {
      const updatedCar = await this.carRepo.save(car);
      if (updatedCar.owner && typeof updatedCar.owner === 'object') {
        (updatedCar.owner as any).password = undefined;
      }
      return updatedCar;
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('A car with this license plate already exists.');
      }
      throw error;
    }
  }

  async deleteCar(carId: number, userPayload: { userId: number }) {
    const user = await this.userRepo.findOne({ where: { id: userPayload.userId } });
    if (!user) throw new NotFoundException('User not found');
    const car = await this.carRepo.findOne({ where: { id: carId }, relations: ['owner'] });

    if (!car) {
      throw new NotFoundException('Car not found with the provided ID.');
    }

    if (car.owner.id !== user.id) {
      throw new ForbiddenException('You can only delete your own car.');
    }

    await this.carRepo.remove(car);
    return { message: 'Car deleted successfully' };
  }
}
