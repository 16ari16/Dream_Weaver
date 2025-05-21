
import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/contexts/LanguageContext'; // Новый импорт

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'], // Keep latin for Geist font
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'], // Keep latin for Geist font
});

// Metadata can be dynamic later if needed using generateMetadata
export const metadata: Metadata = {
  title: 'Ткач Снов | Dream Weaver', // Generic title
  description: 'Исследуйте гобелен вашего разума с помощью ИИ. | Explore the tapestry of your mind with AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The lang attribute will be dynamically set by LanguageProvider on the client-side
    <html lang="ru" suppressHydrationWarning> 
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <LanguageProvider> {/* LanguageProvider wraps Providers */}
            <Providers>
              {children}
            </Providers>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
