import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', weight: ['400', '600', '700', '800', '900'] });

export const metadata: Metadata = {
 title: 'FreshCo — Klasifikasi Kesegaran Ikan',
 description: 'AI-powered fish freshness classifier for TPI fish collectors. Distribusi ikan berbasis kondisi, bukan tebakan.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
 <html lang="id">
 <body className={`${inter.variable} ${outfit.variable} font-sans bg-white text-[#0A0A1A] antialiased`}>
 {children}
 </body>
 </html>
 );
}
