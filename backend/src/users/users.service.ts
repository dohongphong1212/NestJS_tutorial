import { Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { USERS_REPOSITORY } from './users.repository';
import type { CreateUserData, UsersRepository } from './users.repository';

/**
 * Tầng nghiệp vụ cho User. Không truy cập DB trực tiếp — uỷ thác mọi thao tác
 * dữ liệu cho UsersRepository (inject qua token USERS_REPOSITORY).
 */
@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
  ) {}

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findByUsername(username);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  create(data: CreateUserData): Promise<User> {
    return this.usersRepository.create(data);
  }

  setRefreshTokenHash(
    id: number,
    refreshTokenHash: string | null,
  ): Promise<User> {
    return this.usersRepository.setRefreshTokenHash(id, refreshTokenHash);
  }
}
