import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <div
      className={cn('h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary', className)}
      role="status"
      aria-label="Loading"
      {...props}
    />
  );
}

export default Spinner;
