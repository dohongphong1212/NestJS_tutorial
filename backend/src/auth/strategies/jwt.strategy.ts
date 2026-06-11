import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { getJwtSecret } from '../jwt-secret';

interface JwtPayload {
  sub: number;
  email: string;
}

/** Lấy access token từ cookie HttpOnly 'access_token'. */
function cookieExtractor(req: Request): string | null {
  const cookies = (req as Request & { cookies?: Record<string, string> })
    .cookies;
  return cookies?.access_token ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
    }
    const { password: _password, refreshTokenHash: _hash, ...rest } = user;
    return rest;
  }
}
