'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  change?: string;
  positive?: boolean;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, subtitle, change, positive = true, icon }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {subtitle && <CardDescription className="text-xs">{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">{value}</span>
          {change && (
            <span className={`text-sm font-medium ${positive ? 'text-success' : 'text-danger'}`}>
              {change}
            </span>
          )}
        </div>
      </CardContent>
      {icon && (
        <CardFooter>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Trend</span>
            <span className="text-muted-foreground">{icon}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}