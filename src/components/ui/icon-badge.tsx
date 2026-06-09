import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

type Variant = 'default' | 'violet' | 'emerald' | 'amber' | 'red';

const variants: Record<Variant, string> = {
  default: 'bg-zinc-800 text-zinc-400',
  violet: 'bg-violet-500/10 text-violet-400',
  emerald: 'bg-emerald-500/10 text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-400',
  red: 'bg-red-500/10 text-red-400',
};

interface IconBadgeProps {
  icon: LucideIcon;
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function IconBadge({
  icon: Icon,
  variant = 'default',
  size = 'md',
  className,
}: IconBadgeProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg',
        variants[variant],
        sizes[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
    </div>
  );
}
