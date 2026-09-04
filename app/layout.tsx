import type { Metadata, Viewport } from 'next';
import './globals.css';
import './neon.css';

export const metadata: Metadata = { title: 'Kiki World', description: 'Explore Kiki World, a story-driven 3D studio with an animated avatar.' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#070711' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
