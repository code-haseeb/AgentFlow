import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { AddMemberDto } from './dto/invite-member.dto';
import { Role } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(userId: string, dto: CreateOrganizationDto) {
    const baseSlug = this.slugify(dto.name) || 'workspace';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${baseSlug}-${randomSuffix}`;

    return this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: dto.name.trim(),
          slug,
        },
      });

      const member = await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId,
          role: Role.OWNER,
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId: org.id,
          userId,
          action: 'ORGANIZATION_CREATED',
          entityType: 'Organization',
          entityId: org.id,
          details: { name: org.name, slug: org.slug },
        },
      });

      return { ...org, role: member.role };
    });
  }

  async listUserOrganizations(userId: string) {
    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((m) => ({
      ...m.organization,
      role: m.role,
    }));
  }

  async getOrganization(orgId: string, userId: string) {
    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId,
        },
      },
      include: {
        organization: {
          include: {
            _count: {
              select: {
                members: true,
                workflows: true,
              },
            },
          },
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this organization');
    }

    return {
      ...membership.organization,
      role: membership.role,
    };
  }

  async getMembers(orgId: string, userId: string) {
    // Verify user belongs to org
    const userMember = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId,
        },
      },
    });

    if (!userMember) {
      throw new ForbiddenException('Access denied');
    }

    const members = await this.prisma.organizationMember.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return members;
  }

  async addOrUpdateMember(
    orgId: string,
    initiatorId: string,
    dto: AddMemberDto,
  ) {
    const targetUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!targetUser) {
      throw new NotFoundException(
        `User with email ${dto.email} not found. Please ask them to register first.`,
      );
    }

    const member = await this.prisma.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: targetUser.id,
        },
      },
      update: {
        role: dto.role,
      },
      create: {
        organizationId: orgId,
        userId: targetUser.id,
        role: dto.role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId: initiatorId,
        action: 'MEMBER_UPDATED',
        entityType: 'OrganizationMember',
        entityId: member.id,
        details: { targetUserId: targetUser.id, role: dto.role },
      },
    });

    return member;
  }
}
