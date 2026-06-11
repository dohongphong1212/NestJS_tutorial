const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export interface AuthUser {
  id: number;
  name: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Gọi API. Token nằm trong cookie HttpOnly do backend đặt, nên luôn gửi kèm
 * cookie bằng `credentials: 'include'` (không tự lưu token ở client).
 */
async function request<T>(path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error('Không thể kết nối tới máy chủ. Vui lòng thử lại.');
  }

  const data = (await res.json().catch(() => null)) as
    | { message?: string | string[] }
    | T
    | null;

  if (!res.ok) {
    const message = (data as { message?: string | string[] })?.message;
    const text = Array.isArray(message) ? message[0] : message;
    throw new Error(text ?? 'Đã có lỗi xảy ra, vui lòng thử lại.');
  }

  return data as T;
}

export function login(username: string, password: string) {
  return request<AuthUser>('/auth/login', { username, password });
}

export function register(
  name: string,
  username: string,
  email: string,
  password: string,
) {
  return request<AuthUser>('/auth/register', {
    name,
    username,
    email,
    password,
  });
}

/** Cấp lại token mới (xoay vòng) khi access token hết hạn. */
export function refresh() {
  return request<AuthUser>('/auth/refresh');
}

/** Đăng xuất: backend xoá cookie + vô hiệu refresh token. */
export function logout() {
  return request<{ message: string }>('/auth/logout');
}
