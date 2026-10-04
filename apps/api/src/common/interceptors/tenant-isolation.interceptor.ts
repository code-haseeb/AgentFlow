import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantIsolationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const orgId = request.headers['x-organization-id'];

    if (orgId) {
      request.activeOrgId = orgId;
    }

    return next.handle();
  }
}
