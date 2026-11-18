'use client';

import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DataTableProps<T> {
  columns: { key: string; header: string; render?: (item: T) => React.ReactNode }[];
  data: T[];
  loading?: boolean;
  rowKey?: (item: T) => string;
}

export function DataTable<T>({ columns, data, loading, rowKey = (item: any) => item._id }: DataTableProps<T>) {
  const headerColumns = useMemo(() => columns.filter((c) => !c.render), [columns]);
  const cellColumns = useMemo(() => columns.filter((c) => !!c.render), [columns]);

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-3/4 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return <div className="text-center py-8 text-muted-foreground">No records found</div>;
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-soft">
      <Table>
        <TableHeader>
          <TableRow>
            {headerColumns.map((column) => (
              <TableHead key={column.key}>{column.header}</TableHead>
            ))}
            {cellColumns.length > 0 && <TableHead className="w-[120px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={rowKey(item)}>
              {headerColumns.map((column) => (
                <TableCell key={column.key}>
                  {typeof column.render === 'function' ? column.render(item) : (item as any)[column.key]}
                </TableCell>
              ))}
              {cellColumns.length > 0 && (
                <TableCell className="text-right">{cellColumns.map((c) => c.render?.(item))}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}