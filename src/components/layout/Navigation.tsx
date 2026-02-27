'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: 'Dashboard', href: '/' },
  { label: 'Pipelines', href: '/pipelines' },
  { label: 'Create Pipeline', href: '/pipelines/new' }
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold" aria-label="Go to dashboard">
          Terraform Pipelines
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm text-foreground hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <span className="text-sm text-muted-foreground">Loading...</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm">{user.name}</span>
              <Button variant="outline" size="sm" onClick={logout} aria-label="Log out">
                Log out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" aria-label="Log in">
                Log in
              </Button>
              <Button size="sm" aria-label="Sign up">
                Sign up
              </Button>
            </div>
          )}
        </div>

        <button
          className="inline-flex items-center justify-center rounded-md border border-border p-2 md:hidden"
          onClick={() => setOpen(prev => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          <span className="sr-only">Toggle menu</span>
          <div className="space-y-1">
            <span className="block h-0.5 w-5 bg-foreground" />
            <span className="block h-0.5 w-5 bg-foreground" />
            <span className="block h-0.5 w-5 bg-foreground" />
          </div>
        </button>
      </div>

      <div className={cn('border-t border-border bg-background md:hidden', open ? 'block' : 'hidden')}>
        <nav className="flex flex-col gap-2 px-4 py-3" aria-label="Mobile navigation">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm text-foreground hover:text-primary">
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            {loading ? (
              <span className="text-sm text-muted-foreground">Loading...</span>
            ) : user ? (
              <Button variant="outline" size="sm" onClick={logout} aria-label="Log out">
                Log out
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" aria-label="Log in">
                  Log in
                </Button>
                <Button size="sm" aria-label="Sign up">
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navigation;
