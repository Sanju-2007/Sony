import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './reports.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async submitReport(@CurrentUser('id') userId: string, @Body() dto: CreateReportDto) {
    return this.reportsService.createReport(userId, dto);
  }

  @Get()
  async getReports(@Query('status') status?: string) {
    return this.reportsService.getReports(status);
  }
}
