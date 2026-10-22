import type { Metadata } from 'next';
import React from 'react';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'Solarithm Engineering Submission Studio',
  description:
    'Enterprise-grade solar engineering report and PDF submission studio with double-bordered technical drawings, shadow analysis, and structured engineering note libraries.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F4F4F5] text-zinc-900 dark:bg-[#0E0E10] dark:text-zinc-100 min-h-screen antialiased selection:bg-[#D4AF37] selection:text-black">
        {children}
      </body>
    </html>
  );
}
