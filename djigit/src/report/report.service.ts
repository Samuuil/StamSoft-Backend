import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from '../../typeorm/src/entity/report.entity';
import { Repository } from 'typeorm';
import { User } from '../../typeorm/src/entity/user.entity';

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
}
