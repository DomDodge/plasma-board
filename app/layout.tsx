import type { Metadata } from "next";
import { Inter } from 'next/font/google'; // 1. Import Inter
import "./globals.css";

// Font Awesome
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

// Inter Font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Plasma Boards",
  description: "Internal tool used by Plasma Studios to improve development",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 3. Apply inter.className here */}
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}