import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateReportDto } from './reports.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReport(reporterId: string, dto: CreateReportDto) {
    const report = await this.prisma.report.create({
      data: {
        reporterId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reason: dto.reason,
        details: dto.details,
      },
    });

    return {
      success: true,
      reportId: report.id,
      message: 'Report submitted for moderator review',
    };
  }

  async getReports(status = 'PENDING') {
    return this.prisma.report.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
  }
}
