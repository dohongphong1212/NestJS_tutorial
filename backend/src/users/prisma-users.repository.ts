import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserData, UsersRepository } from './users.repository';

/**
 * Triển khai UsersRepository bằng Prisma.
 * Đây là tầng DB thuần: chỉ map lời gọi sang truy vấn Prisma, không có logic nghiệp vụ.
 */
@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({ data });
  }

  setRefreshTokenHash(
    id: number,
    refreshTokenHash: string | null,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { refreshTokenHash },
    });
  }
}
