import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { getJwtSecret } from './jwt-secret';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: getJwtSecret(),
      // Access token ngắn hạn; refresh token (7 ngày) ký riêng trong AuthService
      signOptions: { expiresIn: '15m', algorithm: 'HS256' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
