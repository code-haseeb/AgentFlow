import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { RunWorkflowDto } from './dto/run-workflow.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentOrgId } from '../../common/decorators/current-org.decorator';
import { Role } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get('workflows')
  @Roles(Role.VIEWER)
  async list(@CurrentOrgId() orgId: string) {
    return this.workflowsService.list(orgId);
  }

  @Get('workflows/:id')
  @Roles(Role.VIEWER)
  async getOne(
    @Param('id') id: string,
    @CurrentOrgId() orgId: string,
  ) {
    return this.workflowsService.getOne(id, orgId);
  }

  @Post('workflows')
  @Roles(Role.MANAGER)
  async create(
    @CurrentOrgId() orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWorkflowDto,
  ) {
    return this.workflowsService.create(orgId, userId, dto);
  }

  @Post('workflows/:id/runs')
  @Roles(Role.ANALYST)
  async executeRun(
    @Param('id') workflowId: string,
    @CurrentOrgId() orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RunWorkflowDto,
  ) {
    return this.workflowsService.executeRun(workflowId, orgId, userId, dto);
  }

  @Get('runs')
  @Roles(Role.VIEWER)
  async listAllRuns(@CurrentOrgId() orgId: string) {
    return this.workflowsService.listAllRuns(orgId);
  }

  @Get('runs/:id')
  @Roles(Role.VIEWER)
  async getRun(
    @Param('id') id: string,
    @CurrentOrgId() orgId: string,
  ) {
    return this.workflowsService.getRun(id, orgId);
  }

  @Get('tools')
  @Roles(Role.VIEWER)
  async getTools() {
    return this.workflowsService.getTools();
  }

  @Post('runs/:id/approve')
  @Roles(Role.MANAGER)
  async approveRun(
    @Param('id') id: string,
    @CurrentOrgId() orgId: string,
    @CurrentUser('id') userId: string,
    @Body('comment') comment?: string,
  ) {
    return this.workflowsService.approveRun(id, orgId, userId, comment);
  }

  @Post('runs/:id/reject')
  @Roles(Role.MANAGER)
  async rejectRun(
    @Param('id') id: string,
    @CurrentOrgId() orgId: string,
    @CurrentUser('id') userId: string,
    @Body('reason') reason?: string,
  ) {
    return this.workflowsService.rejectRun(id, orgId, userId, reason);
  }
}
