import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from '../../typeorm/src/entity/report.entity';
import { User } from '../../typeorm/src/entity/user.entity';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { Car } from '../../typeorm/src/entity/car.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, User, Car])],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [TypeOrmModule],
})
export class ReportModule {}
