import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Đăng nhập • Nebula',
  description: 'Trải nghiệm đăng nhập hiện đại, cá nhân hoá.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
