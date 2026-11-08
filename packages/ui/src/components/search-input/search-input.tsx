import { SearchIcon } from 'lucide-react';
import type { ChangeEvent, ComponentPropsWithoutRef } from 'react';
import { Input } from '../../base/input/input';
import { cn } from '../../lib/utils';

export interface SearchInputProps extends Omit<
  ComponentPropsWithoutRef<'input'>,
  'onChange' | 'value' | 'type'
> {
  id: string;
  /** Visible label text; set hideLabel to keep it for assistive technology only. */
  label: string;
  hideLabel?: boolean;
  value: string;
  onChange: (value: string) => void;
  /** Announced politely to screen readers whenever it changes, e.g. "12 results". */
  statusText?: string;
}

/** Labelled search field with a polite live region for result counts. */
export function SearchInput({
  id,
  label,
  hideLabel = false,
  value,
  onChange,
  statusText,
  className,
  ...rest
}: SearchInputProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label
        htmlFor={id}
        className={cn(
          'font-body text-xs tracking-[0.18em] text-muted-foreground uppercase',
          hideLabel && 'sr-only',
        )}
      >
        {label}
      </label>
      <div className="relative">
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={id}
          type="search"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          // A bare field on an ink underline. md: and dark: repeat values the base Input sets
          // under those variants, so this look holds at every width and colour scheme.
          className="h-14 rounded-none border-0 border-b bg-transparent pl-10 font-heading text-2xl shadow-none focus-visible:border-primary focus-visible:ring-0 md:text-2xl dark:bg-transparent"
          autoComplete="off"
          spellCheck={false}
          {...rest}
        />
      </div>
      <div role="status" aria-live="polite" className="sr-only">
        {statusText}
      </div>
    </div>
  );
}
