import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from '../typeorm/src/entity/report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report])],
  exports: [TypeOrmModule],
})
export class ReportModule {}
