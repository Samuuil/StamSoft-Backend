import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from '../../typeorm/src/entity/report.entity';
import { User } from '../../typeorm/src/entity/user.entity';
import { ReportController } from 'src/report.controller';
import { ReportService } from 'src/report.service';

@Module({
  imports: [TypeOrmModule.forFeature([Report, User])],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [TypeOrmModule],
})
export class ReportModule {}
