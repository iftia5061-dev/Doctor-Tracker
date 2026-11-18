'use client';

import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <Card className="text-center py-12 border-dashed">
      <CardContent>
        {icon && <div className="mx-auto mb-4 opacity-50">{icon}</div>}
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {action && <div className="mt-6">{action}</div>}
      </CardContent>
    </Card>
  );
}