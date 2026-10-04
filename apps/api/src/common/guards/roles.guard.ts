import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

const RoleHierarchy: Record<Role, number> = {
  [Role.OWNER]: 100,
  [Role.ADMIN]: 80,
  [Role.MANAGER]: 60,
  [Role.ANALYST]: 40,
  [Role.VIEWER]: 20,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    // Determine target organization from headers or request parameters
    const orgId =
      request.headers['x-organization-id'] ||
      request.params.organizationId ||
      request.params.orgId ||
      request.body?.organizationId;

    if (!orgId) {
      throw new ForbiddenException('Organization context (x-organization-id) is required for role validation');
    }

    // Query membership in the specified organization
    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('User is not a member of this organization');
    }

    // Attach verified membership to request
    request.userMembership = membership;

    // Check if user's role meets the minimum required role level
    const userScore = RoleHierarchy[membership.role] || 0;
    const hasPermission = requiredRoles.some(
      (role) => userScore >= (RoleHierarchy[role] || 0),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions: Requires ${requiredRoles.join(' or ')} but current role is ${membership.role}`,
      );
    }

    return true;
  }
}
