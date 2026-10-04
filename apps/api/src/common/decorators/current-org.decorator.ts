import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentOrgId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    // Org ID can come from header x-organization-id or query or active membership
    return request.headers['x-organization-id'] || request.activeOrgId;
  },
);
