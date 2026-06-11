/**
 * Lấy JWT secret từ biến môi trường, fail-fast nếu thiếu hoặc yếu.
 * KHÔNG dùng giá trị mặc định — secret mặc định công khai cho phép giả mạo token.
 */
function readSecret(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Thiếu ${name}. Đặt một chuỗi bí mật mạnh trong backend/.env. ` +
        "Tạo nhanh: node -e \"console.log(require('crypto').randomBytes(48).toString('base64url'))\"",
    );
  }
  if (value.length < 32) {
    throw new Error(
      `${name} không an toàn (ngắn hơn 32 ký tự). Hãy thay bằng chuỗi ngẫu nhiên dài.`,
    );
  }
  return value;
}

/** Secret ký/xác minh access token. */
export function getJwtSecret(): string {
  return readSecret('JWT_SECRET', process.env.JWT_SECRET);
}

/** Secret ký/xác minh refresh token (tách riêng để cô lập rủi ro). */
export function getRefreshSecret(): string {
  return readSecret('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET);
}
