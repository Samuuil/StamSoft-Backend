import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from '../../typeorm/src/entity/report.entity';
import { Repository } from 'typeorm';
import { User } from '../../typeorm/src/entity/user.entity';
import { ReportDto, UserDto } from './dto/report.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepo: Repository<Report>,

    @InjectRepository(User)
    private userRepo: Repository<User>, 
  ) {}

  async createReport(data: {
    imageUrl?: string;
    videoUrl?: string;
    description?: string;
    licensePlate: string;
    latitude: number;
    longitude: number;
    user: { userId: number };
  }) {
    const userEntity = await this.userRepo.findOne({
      where: { id: data.user.userId },
    });
  
    if (!userEntity) {
      throw new Error('User not found');
    }
  
    const report = this.reportRepo.create({
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      description: data.description,
      licensePlate: data.licensePlate,
      latitude: data.latitude,
      longitude: data.longitude,
      reportedBy: userEntity,
    });
  
    return this.reportRepo.save(report);
  }

  async getLatestReports(limit = 30): Promise<ReportDto[]> {
    const reports = await this.reportRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['reportedBy'],
    });

    return reports.map(report => {
      const userDto: UserDto = {
        id: report.reportedBy.id,
        email: report.reportedBy.email,
      };

      const reportDto: ReportDto = {
        id: report.id,
        licensePlate: report.licensePlate,
        description: report.description,
        latitude: report.latitude,
        longitude: report.longitude,
        createdAt: report.createdAt,
        imageUrl: report.imageUrl,
        videoUrl: report.videoUrl,
        reportedBy: userDto,
      };

      return reportDto;
    });
  }

  async deleteReport(reportId: number, userId: number): Promise<void> {
    const report = await this.reportRepo.findOne({
      where: { id: reportId },
      relations: ['reportedBy'],
    });
  
    if (!report) {
      throw new Error('Report not found');
    }
  
    if (report.reportedBy.id !== userId) {
      throw new Error('You do not have permission to delete this report');
    }
  
    await this.reportRepo.delete(reportId);
  }
}
