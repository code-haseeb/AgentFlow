import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async register(dto: RegisterDto) {
    // 1. Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // 3. Create unique organization slug
    const baseSlug = this.slugify(dto.organizationName) || 'workspace';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${baseSlug}-${randomSuffix}`;

    // 4. Transaction: User + Organization + Member (OWNER)
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          passwordHash,
          name: dto.name.trim(),
        },
      });

      const organization = await tx.organization.create({
        data: {
          name: dto.organizationName.trim(),
          slug,
        },
      });

      const member = await tx.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          role: Role.OWNER,
        },
      });

      // Audit log registration
      await tx.auditLog.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          action: 'USER_REGISTERED',
          entityType: 'User',
          entityId: user.id,
          details: { email: user.email, organizationName: organization.name },
        },
      });

      return { user, organization, member };
    });

    const tokens = await this.generateTokens(result.user.id, result.user.email);

    return {
      tokens,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      currentOrganization: result.organization,
      role: Role.OWNER,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    const firstMembership = user.memberships[0];

    return {
      tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      currentOrganization: firstMembership?.organization || null,
      role: firstMembership?.role || null,
      organizations: user.memberships.map((m) => ({
        organization: m.organization,
        role: m.role,
      })),
    };
  }

  async getSession(userId: string, activeOrgId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    let activeMembership = user.memberships.find(
      (m) => m.organizationId === activeOrgId,
    );

    if (!activeMembership && user.memberships.length > 0) {
      activeMembership = user.memberships[0];
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      currentOrganization: activeMembership?.organization || null,
      role: activeMembership?.role || null,
      organizations: user.memberships.map((m) => ({
        organization: m.organization,
        role: m.role,
      })),
    };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1d'),
      secret:
        this.configService.get<string>('JWT_SECRET') ||
        'super-secret-agentflow-jwt-key-change-in-production-min-32-chars',
    });

    return {
      accessToken,
      expiresIn: 86400,
    };
  }
}
