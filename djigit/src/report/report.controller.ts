import {
    Controller,
    Post,
    Delete,
    UseInterceptors,
    UploadedFiles,
    UseGuards,
    Request,
    Body,
    Get,
    Query,
    Param
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { FilesInterceptor } from '@nestjs/platform-express';
  import { ReportService } from './report.service';
  import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiOkResponse, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
  
  @ApiTags('report')
  @ApiBearerAuth()
  @Controller('reports')
  export class ReportController {
    constructor(private readonly reportService: ReportService) {}
  
    @ApiOperation({ summary: 'Upload a new report with files (image/video)' })
    @ApiBody({ description: 'Report upload data', schema: { example: {
      files: 'file',
      description: 'Broken window',
      licensePlate: 'ABC123',
      latitude: '40.7128',
      longitude: '-74.0060'
    }}})
    @ApiOkResponse({ description: 'Report successfully created', schema: { example: {
      id: 1,
      imageUrls: [
        'https://.../file1.jpg',
        'https://.../file2.jpg'
      ],
      videoUrl: null,
      description: 'Broken window',
      licensePlate: 'ABC123',
      latitude: 40.7128,
      longitude: -74.0060,
      createdAt: '2024-07-03T10:00:00.000Z',
      reportedBy: { id: 1, email: 'user@example.com' }
    }}})
    @ApiResponse({ status: 401, description: 'Unauthorized. JWT token missing or invalid.' })
    @Post('upload')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FilesInterceptor('files'))
    async uploadReport(
      @UploadedFiles() files: Express.Multer.File[],
      @Request() req,
      @Body('description') description: string,
      @Body('licensePlate') licensePlate: string,
      @Body('latitude') latitude: string,
      @Body('longitude') longitude: string,
    ) {
      return this.reportService.uploadReportWithFiles(files, {
        description,
        licensePlate,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        user: req.user,
      });
    }

    @ApiOperation({ summary: 'Get all reports for the authenticated user\'s cars' })
    @ApiOkResponse({ description: 'Array of reports for user\'s cars', schema: { example: [
      {
        id: 1,
        imageUrls: [
          'https://.../file1.jpg',
          'https://.../file2.jpg'
        ],
        videoUrl: null,
        description: 'Broken window',
        licensePlate: 'ABC123',
        latitude: 40.7128,
        longitude: -74.0060,
        createdAt: '2024-07-03T10:00:00.000Z',
        reportedBy: { id: 1, email: 'user@example.com' }
      }
    ]}})
    @ApiResponse({ status: 401, description: 'Unauthorized. JWT token missing or invalid.' })
    @UseGuards(AuthGuard('jwt'))
    @Get('my-cars')
    async getReportsForMyCars(@Request() req) {
      return this.reportService.getReportsForUserCars(req.user.userId);
    }

    @ApiOperation({ summary: 'Search for all reports by license plate' })
    @ApiQuery({ name: 'licensePlate', type: String, example: 'ABC123' })
    @ApiOkResponse({ description: 'Array of reports for the given license plate', schema: { example: [
    {
        id: 1,
        imageUrls: [
          'https://.../file1.jpg',
          'https://.../file2.jpg'
        ],
        videoUrl: null,
        description: 'Broken window',
        licensePlate: 'ABC123',
        latitude: 40.7128,
        longitude: -74.0060,
        createdAt: '2024-07-03T10:00:00.000Z',
        reportedBy: { id: 1, email: 'user@example.com' }
    }
    ]}})
    @ApiResponse({ status: 401, description: 'Unauthorized. JWT token missing or invalid.' })
    @UseGuards(AuthGuard('jwt'))
    @Get('search-by-plate')
    async getReportsByLicensePlate(@Query('licensePlate') licensePlate: string) {
      return this.reportService.getReportsByLicensePlate(licensePlate);
    }

    @ApiOperation({ summary: 'Get the most recent reports' })
    @ApiOkResponse({ description: 'Array of the most recent reports', schema: { example: [
      {
        id: 1,
        licensePlate: 'ABC123',
        description: 'Broken window',
        latitude: 40.7128,
        longitude: -74.0060,
        createdAt: '2024-07-03T10:00:00.000Z',
        imageUrls: [
          'https://.../file1.jpg',
          'https://.../file2.jpg'
        ],
        videoUrl: null,
        reportedBy: { id: 1, email: 'user@example.com' }
      }
    ]}})
    @ApiResponse({ status: 401, description: 'Unauthorized. JWT token missing or invalid.' })
    @UseGuards(AuthGuard('jwt'))
    @Get('recent')
    async getRecentReports() {
      return this.reportService.getLatestReports();
    }

    @ApiOperation({ summary: 'Delete a report by ID (only by the user who created it)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiOkResponse({ description: 'Report successfully deleted', schema: { example: { message: 'Report deleted successfully' } } })
    @ApiResponse({ status: 401, description: 'Unauthorized. JWT token missing or invalid.' })
    @ApiResponse({ status: 403, description: 'Forbidden. You can only delete your own report.' })
    @ApiResponse({ status: 404, description: 'Report not found with the provided ID.' })
    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async deleteReport(@Request() req, @Param('id') id: number) {
      await this.reportService.deleteReport(id, req.user.userId);
      return { message: 'Report deleted successfully' };
    }
  }
  