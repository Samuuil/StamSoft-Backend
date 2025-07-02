import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
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
  ) {}

  async addCar(createCarDto: CreateCarDto, user: User) {
    const car = this.carRepo.create({
      ...createCarDto,
      owner: user,
    });
    return this.carRepo.save(car);
  }

  async updateCar(carId: number, updateCarDto: UpdateCarDto, user: User) {
    const car = await this.carRepo.findOne({ where: { id: carId }, relations: ['owner'] });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    if (car.owner.id !== user.id) {
      throw new ForbiddenException('You can only update your own car');
    }

    Object.assign(car, updateCarDto);
    return this.carRepo.save(car);
  }

  async deleteCar(carId: number, user: User) {
    const car = await this.carRepo.findOne({ where: { id: carId }, relations: ['owner'] });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    if (car.owner.id !== user.id) {
      throw new ForbiddenException('You can only delete your own car');
    }

    await this.carRepo.remove(car);
    return { message: 'Car deleted successfully' };
  }
}
