/** Thông tin người dùng (an toàn) backend trả về — không gồm password/token. */
export interface AuthUser {
  id: number;
  name: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

/** Chế độ form xác thực. */
export type Mode = 'login' | 'register';

/** Trạng thái kết nối hiển thị trên trang chủ. */
export type ConnState = 'checking' | 'ok' | 'down';
