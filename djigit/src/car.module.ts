import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from '../typeorm/src/entity/car.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Car])],
  exports: [TypeOrmModule],
})
export class CarModule {}
