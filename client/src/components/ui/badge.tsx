import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary-600 text-primary-50 hover:bg-primary-700',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-danger text-danger-50 hover:bg-danger/90',
        outline: 'text-foreground border-input',
        success:
          'border-transparent bg-success text-success-50 hover:bg-success/90',
        warning:
          'border-transparent bg-warning text-warning-50 hover:bg-warning/90',
        danger:
          'border-transparent bg-danger text-danger-50 hover:bg-danger/90',
        info: 'border-transparent bg-info text-info-50 hover:bg-info/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };