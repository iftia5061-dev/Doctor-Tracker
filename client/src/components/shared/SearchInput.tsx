'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

export function SearchInput({
  placeholder = 'Search...',
  value,
  onChange,
  debounceMs = 400,
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value ?? '');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.currentTarget.value;
      setInputValue(val);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => onChange(val), debounceMs);
    },
    [onChange, debounceMs]
  );

  // Sync external value changes
  useEffect(() => {
    if (inputValue !== value) setInputValue(value ?? '');
  }, [value, inputValue]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        className="pl-10"
      />
    </div>
  );
}