import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentOrgId } from '../../common/decorators/current-org.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setAuthCookie(res, result.tokens.accessToken);
    return result;
  }

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setAuthCookie(res, result.tokens.accessToken);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(
    @CurrentUser('id') userId: string,
    @CurrentOrgId() orgId?: string,
  ) {
    return this.authService.getSession(userId, orgId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('agentflow_access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return { success: true, message: 'Logged out successfully' };
  }

  private setAuthCookie(res: Response, token: string) {
    res.cookie('agentflow_access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }
}
