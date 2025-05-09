import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono'; // This line was commented out in a previous step, related to module not found error
import './globals.css';
import { Toaster } from "@/components/ui/toaster";


export const metadata: Metadata = {
  title: 'MathMate - Advanced Calculator',
  description: 'An advanced calculator with calculus solving, graph plotting, and trigonometric functions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} font-sans`}>
      {/* 
        Explicit <head /> tag. Next.js App Router primarily uses the metadata export 
        to populate the head, but this helps define the document structure.
        The main fix for the hydration error is ensuring no unintended whitespace
        text nodes are direct children of <html>.
      */}
      <head />
      <body className={`antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}