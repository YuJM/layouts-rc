import 'layouts-rc/styles.css';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { OverlayManagerProvider } from '@components/overlay-manager-provider.tsx';
import { cn } from '@/lib/utils.ts';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Layouts-rc',
  description: 'Layouts-rc demo site',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen font-sans antialiased dark',
          fontSans.variable,
        )}
      >
        {children}
        <OverlayManagerProvider />
      </body>
    </html>
  );
}
