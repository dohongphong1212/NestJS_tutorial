import type { AuthUser } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// Các route KHÔNG được tự refresh khi gặp 401:
// - /auth/refresh: refresh thất bại thì đành chịu (tránh đệ quy vô hạn).
// - /auth/login, /auth/register: 401 ở đây là sai mật khẩu, không phải hết hạn token.
const NO_REFRESH_PATHS = ['/auth/refresh', '/auth/login', '/auth/register'];

/** Gọi fetch thuần (kèm cookie). Tách riêng để dùng lại khi thử lại sau refresh. */
function rawFetch(
  path: string,
  body: unknown,
  method: 'GET' | 'POST',
): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/**
 * Gọi API. Token nằm trong cookie HttpOnly do backend đặt, nên luôn gửi kèm
 * cookie bằng `credentials: 'include'` (không tự lưu token ở client).
 *
 * Tự làm mới phiên: nếu request bị 401 (access token hết hạn) thì gọi
 * `/auth/refresh` MỘT lần để xoay vòng token, rồi thử lại request gốc.
 */
async function request<T>(
  path: string,
  body?: unknown,
  method: 'GET' | 'POST' = 'POST',
): Promise<T> {
  let res: Response;
  try {
    res = await rawFetch(path, body, method);

    // Access token hết hạn -> thử refresh 1 lần rồi gọi lại request gốc.
    if (res.status === 401 && !NO_REFRESH_PATHS.includes(path)) {
      const refreshed = await rawFetch('/auth/refresh', undefined, 'POST');
      if (refreshed.ok) {
        res = await rawFetch(path, body, method);
      }
    }
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

/** Lấy thông tin người dùng đang đăng nhập (đọc từ cookie access_token). */
export function me() {
  return request<AuthUser>('/auth/me', undefined, 'GET');
}

/** Cấp lại token mới (xoay vòng) khi access token hết hạn. */
export function refresh() {
  return request<AuthUser>('/auth/refresh');
}

/** Đăng xuất: backend xoá cookie + vô hiệu refresh token. */
export function logout() {
  return request<{ message: string }>('/auth/logout');
}
