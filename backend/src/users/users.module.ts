import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaUsersRepository } from './prisma-users.repository';
import { USERS_REPOSITORY } from './users.repository';

@Module({
  providers: [
    UsersService,
    // Bind abstraction (token) -> implementation Prisma. Đổi nguồn dữ liệu
    // sau này chỉ cần thay useClass, không động vào UsersService.
    { provide: USERS_REPOSITORY, useClass: PrismaUsersRepository },
  ],
  exports: [UsersService],
})
export class UsersModule {}
