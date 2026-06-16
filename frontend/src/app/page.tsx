'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { me } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Cổng điều hướng: kiểm tra phiên hiện tại (cookie HttpOnly) rồi chuyển hướng.
 * - Còn phiên hợp lệ (kể cả nhờ auto-refresh) -> /home.
 * - Không có phiên -> /login.
 * Nhờ vậy mở lại trình duyệt khi token còn hạn sẽ KHÔNG bị bắt đăng nhập lại.
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await me();
        if (active) router.replace('/home');
      } catch {
        if (active) router.replace('/login');
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Spinner className="h-6 w-6" />
    </main>
  );
}
