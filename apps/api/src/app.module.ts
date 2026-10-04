import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { AuditModule } from './modules/audit/audit.module';
import { TenantIsolationInterceptor } from './common/interceptors/tenant-isolation.interceptor';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    AuthModule,
    OrganizationsModule,
    WorkflowsModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantIsolationInterceptor,
    },
  ],
})
export class AppModule {}
