import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let prisma: any;

  beforeEach(() => {
    reflector = new Reflector();
    prisma = {
      organizationMember: {
        findUnique: jest.fn(),
      },
    };
    guard = new RolesGuard(reflector, prisma);
  });

  it('should allow access if no roles are required', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const context: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user is not in the organization', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    const context: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'u1' },
          headers: { 'x-organization-id': 'org-1' },
          params: {},
        }),
      }),
    };

    prisma.organizationMember.findUnique.mockResolvedValue(null);

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should allow access if user has sufficient role level (OWNER > ADMIN)', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    const context: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'u1' },
          headers: { 'x-organization-id': 'org-1' },
          params: {},
        }),
      }),
    };

    prisma.organizationMember.findUnique.mockResolvedValue({
      organizationId: 'org-1',
      userId: 'u1',
      role: Role.OWNER,
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should block access if user role is insufficient (VIEWER < ADMIN)', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    const context: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'u1' },
          headers: { 'x-organization-id': 'org-1' },
          params: {},
        }),
      }),
    };

    prisma.organizationMember.findUnique.mockResolvedValue({
      organizationId: 'org-1',
      userId: 'u1',
      role: Role.VIEWER,
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
