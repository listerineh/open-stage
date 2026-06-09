import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
};

export function PageContainer({ children, className, size = 'md' }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className={cn('mx-auto w-full px-6 py-10 md:px-8 lg:px-12', sizes[size], className)}>
        {children}
      </div>
    </div>
  );
}
