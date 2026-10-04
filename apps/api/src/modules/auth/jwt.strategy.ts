import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. From Authorization Bearer header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // 2. From HTTP-only Cookie
        (req) => {
          return req?.cookies?.['agentflow_access_token'] || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'super-secret-agentflow-jwt-key-change-in-production-min-32-chars',
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is invalid or deactivated');
    }

    return user;
  }
}
