import { User } from '@prisma/client';

/** Dữ liệu cần để tạo một user mới (chưa gồm hash refresh token). */
export interface CreateUserData {
  name: string;
  username: string;
  email: string;
  password: string;
}

/**
 * Token DI cho tầng repository của User.
 * Service phụ thuộc vào abstraction này (không phụ thuộc Prisma trực tiếp) ->
 * dễ thay thế nguồn dữ liệu / mock khi test (Dependency Inversion).
 */
export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

/** Hợp đồng truy cập DB cho model User. Chỉ chứa thao tác dữ liệu thuần. */
export interface UsersRepository {
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  setRefreshTokenHash(
    id: number,
    refreshTokenHash: string | null,
  ): Promise<User>;
}
