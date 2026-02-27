import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'secondary' | 'success' | 'warning' | 'error';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  default: 'bg-primary/10 text-primary',
  secondary: 'bg-neutral-100 text-neutral-600',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
};

export function Badge({ children, variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
