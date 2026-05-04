import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const nectoMono = localFont({
  variable: '--font-necto-mono',
  src: '../../public/fonts/NectoMono-Regular.woff2',
  weight: '400',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PWA Probe — Browser Capability Scanner',
  description:
    'See exactly what your browser can do as a PWA. Scan ~80 APIs, get a score, and share your results.',
  applicationName: 'PWA Probe',
  keywords: ['PWA', 'Progressive Web App', 'browser capabilities', 'web APIs'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${nectoMono.variable} dark h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">{children}</body>
    </html>
  );
}
