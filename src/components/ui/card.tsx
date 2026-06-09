import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className,
  interactive = false,
  selected = false,
  onClick,
}: CardProps) {
  const Component = interactive ? 'button' : 'div';

  return (
    <Component
      type={interactive ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'rounded-lg border bg-zinc-900 p-6 text-left transition-all duration-200',
        interactive && 'cursor-pointer hover:border-zinc-700 hover:bg-zinc-800/50',
        selected && 'border-violet-500 bg-violet-500/5 ring-1 ring-violet-500/50',
        !selected && 'border-zinc-800',
        className
      )}
    >
      {children}
    </Component>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return <h3 className={cn('text-base font-medium text-white', className)}>{children}</h3>;
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return <p className={cn('mt-1 text-sm text-zinc-400', className)}>{children}</p>;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={className}>{children}</div>;
}
