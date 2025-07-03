import {
    Controller,
    Post,
    Get,
    Delete,
    UseInterceptors,
    UploadedFiles,
    UseGuards,
    Request,
    Body,
    Param
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { FilesInterceptor } from '@nestjs/platform-express';
  import { ReportService } from './report.service';
  import { s3 } from '../../src/aws/s3';
  import { PutObjectCommand } from '@aws-sdk/client-s3';
  import { v4 as uuidv4 } from 'uuid';
  
  @Controller('reports')
  export class ReportController {
    constructor(private readonly reportService: ReportService) {}
  
    @UseGuards(AuthGuard('jwt'))
    @Post('upload')
    @UseInterceptors(FilesInterceptor('files'))
    async uploadReport(
      @UploadedFiles() files: Express.Multer.File[],
      @Request() req,
      @Body('description') description: string,
      @Body('licensePlate') licensePlate: string,
      @Body('latitude') latitude: string,
      @Body('longitude') longitude: string,
    ) {
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
  
      return this.reportService.createReport({
        ...uploaded,
        description,
        licensePlate,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        user: req.user,
      });
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('recent')
    async getRecentReports() {
      const reports = await this.reportService.getLatestReports(30);
      return reports;
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async deleteReport(@Param('id') id: string, @Request() req) {
      const reportId = parseInt(id, 10);
      await this.reportService.deleteReport(reportId, req.user.userId);
      return { message: 'Report deleted successfully' };
    }
  }
  