import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Tài khoản phải là chuỗi ký tự' })
  @MinLength(3, { message: 'Tài khoản phải có ít nhất 3 ký tự' })
  @MaxLength(50, { message: 'Tài khoản không được vượt quá 50 ký tự' })
  username!: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @MaxLength(72, { message: 'Mật khẩu không được vượt quá 72 ký tự' })
  password!: string;
}
