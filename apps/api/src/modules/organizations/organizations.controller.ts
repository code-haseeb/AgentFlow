import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { AddMemberDto } from './dto/invite-member.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrganizationDto,
  ) {
    return this.orgsService.create(userId, dto);
  }

  @Get()
  async list(@CurrentUser('id') userId: string) {
    return this.orgsService.listUserOrganizations(userId);
  }

  @Get(':id')
  async getOne(
    @Param('id') orgId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.orgsService.getOrganization(orgId, userId);
  }

  @Get(':id/members')
  async getMembers(
    @Param('id') orgId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.orgsService.getMembers(orgId, userId);
  }

  @Post(':id/members')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async addMember(
    @Param('id') orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.orgsService.addOrUpdateMember(orgId, userId, dto);
  }
}
