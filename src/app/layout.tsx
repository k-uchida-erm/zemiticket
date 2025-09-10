import React from 'react';
import AppShell from '../components/templates/AppShell';
import './globals.css';

export const metadata = {
  title: 'Zemiticket',
  description: 'Zemi ticket management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  )
}
