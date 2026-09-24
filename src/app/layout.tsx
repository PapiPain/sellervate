// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sellervate QA - Control de Calidad',
  description: 'Herramienta de auditoría post-soporte y análisis de calidad.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable} data-theme="light">
      <body className="font-sans antialiased bg-[#FAFAFA] text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}