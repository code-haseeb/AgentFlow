import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '@prisma/client';

export class AddMemberDto {
  @IsEmail({}, { message: 'A valid email is required' })
  email: string;

  @IsEnum(Role, { message: 'Valid role is required (OWNER, ADMIN, MANAGER, ANALYST, VIEWER)' })
  role: Role;
}
