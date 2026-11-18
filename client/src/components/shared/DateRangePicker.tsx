'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DateRangePickerProps {
  from?: string;
  to?: string;
  onChange: (range: { from?: string; to?: string }) => void;
  labelFrom?: string;
  labelTo?: string;
}

export function DateRangePicker({
  from,
  to,
  onChange,
  labelFrom = 'From',
  labelTo = 'To',
}: DateRangePickerProps) {
  const [localFrom, setLocalFrom] = useState(from ?? '');
  const [localTo, setLocalTo] = useState(to ?? '');

  return (
    <div className="flex items-end gap-3">
      <div className="flex flex-col">
        <label className="text-xs font-medium text-muted-foreground mb-1">
          {labelFrom}
        </label>
        <Input
          type="date"
          value={localFrom}
          onChange={(e) => {
            setLocalFrom(e.target.value);
            onChange({ from: e.target.value, to: localTo });
          }}
          className="h-9"
          placeholder="From"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-medium text-muted-foreground mb-1">
          {labelTo}
        </label>
        <Input
          type="date"
          value={localTo}
          onChange={(e) => {
            setLocalTo(e.target.value);
            onChange({ from: localFrom, to: e.target.value });
          }}
          className="h-9"
          placeholder="To"
        />
      </div>
      {from || to ? (
        <Button variant="outline" size="sm" onClick={() => { setLocalFrom(''); setLocalTo(''); onChange({ from: '', to: '' }); }}>
          <X className="h-4 w-4" />
        </Button>
      ) : null}
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}