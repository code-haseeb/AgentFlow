import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;
  let configService: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
      organization: {
        create: jest.fn(),
      },
      organizationMember: {
        create: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (cb) => cb(prisma)),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    };

    configService = {
      get: jest.fn().mockReturnValue('1d'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@example.com' });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'Password123!',
          name: 'Test User',
          organizationName: 'Acme',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should register a new user and create an organization with OWNER role', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create = jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      });
      prisma.organization.create.mockResolvedValue({
        id: 'org-1',
        name: 'Acme',
        slug: 'acme-1234',
      });
      prisma.organizationMember.create.mockResolvedValue({
        id: 'mem-1',
        organizationId: 'org-1',
        userId: 'user-1',
        role: 'OWNER',
      });

      const res = await service.register({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
        organizationName: 'Acme',
      });

      expect(res.user.id).toBe('user-1');
      expect(res.currentOrganization.id).toBe('org-1');
      expect(res.role).toBe('OWNER');
      expect(res.tokens.accessToken).toBe('mock-jwt-token');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
