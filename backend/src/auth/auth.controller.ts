import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const ACCESS_MAX_AGE = 15 * 60 * 1000; // 15 phút
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 ngày

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Chống tạo tài khoản hàng loạt: tối đa 3 lần / 60s / IP
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.register(dto);
    this.setAuthCookies(res, accessToken, refreshToken);
    return user;
  }

  // Chống brute-force mật khẩu: tối đa 5 lần / 60s / IP
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.login(dto);
    this.setAuthCookies(res, accessToken, refreshToken);
    return user;
  }

  // Cấp lại cặp token mới từ refresh token (xoay vòng)
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = this.readCookie(req, 'refresh_token');
    const { user, accessToken, refreshToken } =
      await this.authService.refresh(token);
    this.setAuthCookies(res, accessToken, refreshToken);
    return user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(this.readCookie(req, 'refresh_token'));
    this.clearAuthCookies(res);
    return { message: 'Đã đăng xuất' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request & { user: unknown }) {
    return req.user;
  }

  // ===== Helpers =====

  private readCookie(req: Request, name: string): string | undefined {
    const cookies = (req as Request & { cookies?: Record<string, string> })
      .cookies;
    return cookies?.[name];
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: ACCESS_MAX_AGE,
    });
    // Refresh token chỉ gửi tới các route /auth (giảm phơi nhiễm)
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/auth',
      maxAge: REFRESH_MAX_AGE,
    });
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/auth' });
  }
}
