import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from '../../typeorm/src/entity/report.entity';
import { Repository, In } from 'typeorm';
import { User } from '../../typeorm/src/entity/user.entity';
import Redis from 'ioredis';
import { Car } from '../../typeorm/src/entity/car.entity';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../../src/aws/s3';
import { v4 as uuidv4 } from 'uuid';
import { ReportDto, UserDto } from './dto/report.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepo: Repository<Report>,

    @InjectRepository(User)
    private userRepo: Repository<User>, 

    @InjectRepository(Car)
    private carRepo: Repository<Car>,

    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
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

  async getReportsForUserCars(userId: number) {
    const cacheKey = `user:${userId}:carReports`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const cars = await this.carRepo.find({ where: { owner: { id: userId } } });
    const licensePlates = cars.map(car => car.licensePlate);

    if (licensePlates.length === 0) return [];

    const reports = await this.reportRepo.find({
      where: { licensePlate: In(licensePlates) },
      order: { createdAt: 'DESC' },
    });

    await this.redisClient.set(cacheKey, JSON.stringify(reports), 'EX', 300);
    return reports;
  }

  async uploadReportWithFiles(files: Express.Multer.File[], data: {
    description: string;
    licensePlate: string;
    latitude: number;
    longitude: number;
    user: { userId: number };
  }) {
    const uploaded: { imageUrl?: string; videoUrl?: string } = {};
    const bucket = process.env.DO_SPACES_BUCKET;

    for (const file of files) {
      const filename = `${uuidv4()}-${file.originalname}`;
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: filename,
          Body: file.buffer,
          ACL: 'public-read',
          ContentType: file.mimetype,
        }),
      );
      const fileUrl = `https://${bucket}.nyc3.digitaloceanspaces.com/${filename}`;
      if (file.mimetype.startsWith('image')) uploaded.imageUrl = fileUrl;
      if (file.mimetype.startsWith('video')) uploaded.videoUrl = fileUrl;
    }

    return this.createReport({
      ...uploaded,
      description: data.description,
      licensePlate: data.licensePlate,
      latitude: data.latitude,
      longitude: data.longitude,
      user: data.user,
    });
  }
  
async getReportsByLicensePlate(licensePlate: string) {
  // Debug logging
  console.log('Received licensePlate parameter:', licensePlate, 'Type:', typeof licensePlate);
  
  // Check if licensePlate parameter is valid
  if (!licensePlate || typeof licensePlate !== 'string') {
    throw new Error('License plate parameter is required and must be a string');
  }
  
  // Normalize the input license plate
  const normalizedLicensePlate = licensePlate.trim().toLowerCase();
  const cacheKey = `reports:licensePlate:${normalizedLicensePlate}`;
  
  const cached = await this.redisClient.get(cacheKey);
  let reports;
  
  if (cached) {
    reports = JSON.parse(cached);
  } else {
    // Use a more flexible query that handles case-insensitive search
    reports = await this.reportRepo
      .createQueryBuilder('report')
      .where('LOWER(TRIM(report.licensePlate)) = LOWER(TRIM(:licensePlate))', {
        licensePlate: licensePlate
      })
      .orderBy('report.createdAt', 'DESC')
      .getMany();
    
    // Cache the results
    await this.redisClient.set(cacheKey, JSON.stringify(reports), 'EX', 300);
  }
  
  return reports;
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
