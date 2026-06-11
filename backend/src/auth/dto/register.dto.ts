import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'Tên phải là chuỗi ký tự' })
  @MinLength(2, { message: 'Tên phải có ít nhất 2 ký tự' })
  name!: string;

  @IsString({ message: 'Tài khoản phải là chuỗi ký tự' })
  @MinLength(3, { message: 'Tài khoản phải có ít nhất 3 ký tự' })
  @MaxLength(50, { message: 'Tài khoản không được vượt quá 50 ký tự' })
  @Matches(/^[a-zA-Z0-9_.]+$/, {
    message: 'Tài khoản chỉ gồm chữ, số, dấu gạch dưới hoặc dấu chấm',
  })
  username!: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @MaxLength(72, { message: 'Mật khẩu không được vượt quá 72 ký tự' })
  @Matches(/(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Mật khẩu phải gồm cả chữ và số',
  })
  password!: string;
}
