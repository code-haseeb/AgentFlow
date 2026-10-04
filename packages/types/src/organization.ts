export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  ANALYST = 'ANALYST',
  VIEWER = 'VIEWER',
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
  };
}

export const RoleHierarchy: Record<Role, number> = {
  [Role.OWNER]: 100,
  [Role.ADMIN]: 80,
  [Role.MANAGER]: 60,
  [Role.ANALYST]: 40,
  [Role.VIEWER]: 20,
};

export function hasRoleLevel(userRole: Role, requiredRole: Role): boolean {
  return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole];
}
