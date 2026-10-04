import { Organization, Role } from './organization';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  user: User;
  currentOrganization: Organization | null;
  role: Role | null;
  organizations: Array<{
    organization: Organization;
    role: Role;
  }>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface LoginResponse {
  tokens: AuthTokens;
  session: UserSession;
}
