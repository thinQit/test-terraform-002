import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/layout/Navigation';
import { AuthProvider } from '@/providers/AuthProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import Toaster from '@/components/ui/Toaster';

export const metadata: Metadata = {
  title: 'Terraform Pipeline Runner',
  description: 'A minimal web app to test and run Terraform pipelines with CRUD for definitions, run triggers, logs, and health monitoring.'
};

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <ToastProvider>
          <AuthProvider>
            <Navigation />
            <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
            <Toaster />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

export default RootLayout;
