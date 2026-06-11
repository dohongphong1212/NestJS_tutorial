import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { getRefreshSecret } from './jwt-secret';

type SafeUser = Omit<User, 'password' | 'refreshTokenHash'>;

export interface AuthTokens {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

const REFRESH_EXPIRES = '7d';

// Hash giả, tính 1 lần lúc khởi động. Dùng để chạy bcrypt.compare khi user
// không tồn tại -> thời gian phản hồi tương đương, chống dò username qua timing.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('timing-attack-mitigation', 10);

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    // Message gộp chung (không nói rõ trùng username hay email) -> chống dò
    // xem tài khoản/email nào đã tồn tại (user enumeration).
    const [byUsername, byEmail] = await Promise.all([
      this.usersService.findByUsername(dto.username),
      this.usersService.findByEmail(dto.email),
    ]);
    if (byUsername || byEmail) {
      throw new ConflictException('Tài khoản hoặc email đã được sử dụng');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      name: dto.name,
      username: dto.username,
      email: dto.email,
      password: hashed,
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.usersService.findByUsername(dto.username);
    if (!user) {
      // Vẫn chạy bcrypt giả để thời gian phản hồi không tiết lộ user có tồn tại hay không
      await bcrypt.compare(dto.password, DUMMY_PASSWORD_HASH);
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
    }

    return this.issueTokens(user);
  }

  /** Xoay vòng token: xác minh refresh token, đối chiếu hash đã lưu, cấp cặp token mới. */
  async refresh(refreshToken: string | undefined): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn');
    }

    let payload: { sub: number };
    try {
      payload = this.jwtService.verify<{ sub: number }>(refreshToken, {
        secret: getRefreshSecret(),
      });
    } catch {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn');
    }

    const user = await this.usersService.findById(payload.sub);
    if (
      !user ||
      !user.refreshTokenHash ||
      user.refreshTokenHash !== this.hashToken(refreshToken)
    ) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
    }

    return this.issueTokens(user);
  }

  /** Đăng xuất: xoá hash refresh token -> mọi refresh token cũ hết hiệu lực. */
  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    try {
      const payload = this.jwtService.verify<{ sub: number }>(refreshToken, {
        secret: getRefreshSecret(),
      });
      await this.usersService.setRefreshTokenHash(payload.sub, null);
    } catch {
      // token hỏng/hết hạn: không có gì để xoá
    }
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    // Access token: dùng secret + thời hạn mặc định của JwtModule (15 phút)
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
    // Refresh token: secret riêng + thời hạn dài
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { secret: getRefreshSecret(), expiresIn: REFRESH_EXPIRES },
    );

    await this.usersService.setRefreshTokenHash(
      user.id,
      this.hashToken(refreshToken),
    );

    return { user: this.toSafeUser(user), accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private toSafeUser(user: User): SafeUser {
    const { password: _password, refreshTokenHash: _hash, ...rest } = user;
    return rest;
  }
}
