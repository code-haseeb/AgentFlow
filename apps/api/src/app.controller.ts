import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  getRoot() {
    return {
      status: 'healthy',
      service: 'AgentFlow API',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      cluster: {
        database: 'PostgreSQL + pgvector (Connected)',
        cache: 'Redis (Connected)',
      },
    };
  }

  @Public()
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
