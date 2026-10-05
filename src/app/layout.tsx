import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Folio Local',
  description: 'A private, local portfolio builder.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
