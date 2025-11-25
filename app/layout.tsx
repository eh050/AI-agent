import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Research AI Agent',
  description: 'Autonomous research agent powered by Ollama',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
