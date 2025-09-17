import { Inter } from 'next/font/google';
import React from 'react';
import AppShell from '../components/templates/AppShell';
import './globals.css';

export const metadata = {
  title: 'Zemiticket',
  description: 'Zemi ticket management',
}

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  )
}
