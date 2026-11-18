'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
      <p className="text-muted-foreground">
        Showing <b>{Math.min((page - 1) * pageSize + 1, total)}</b> to{' '}
        <b>{Math.min(page * pageSize, total)}</b> of <b>{total}</b> results
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <span className="text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
        {onPageSizeChange && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Rows:</span>
            {[10, 20, 50].map((size) => (
              <Button
                key={size}
                variant={pageSize === size ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageSizeChange(size)}
              >
                {size}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}