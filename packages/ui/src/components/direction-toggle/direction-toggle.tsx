import { useId } from 'react';
import { RadioGroup, RadioGroupItem } from '../../base/radio-group/radio-group';
import { cn } from '../../lib/utils';

export interface DirectionOption<T extends string> {
  value: T;
  label: string;
}

export interface DirectionToggleProps<T extends string> {
  /** Group label, rendered visibly. */
  legend: string;
  options: readonly DirectionOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Radio group for choosing the search direction; keyboard navigable via Radix. */
export function DirectionToggle<T extends string>({
  legend,
  options,
  value,
  onChange,
  className,
}: DirectionToggleProps<T>) {
  const legendId = useId();
  const baseId = useId();
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <span
        id={legendId}
        className="font-body text-xs font-normal tracking-[0.18em] text-muted-foreground uppercase"
      >
        {legend}
      </span>
      <RadioGroup
        aria-labelledby={legendId}
        value={value}
        onValueChange={(next) => onChange(next as T)}
        className="flex flex-wrap gap-x-5 gap-y-2"
      >
        {options.map((option) => {
          const id = `${baseId}-${option.value}`;
          return (
            <div key={option.value} className="flex items-center">
              <RadioGroupItem id={id} value={option.value} />
              <label htmlFor={id} className="cursor-pointer pl-2 text-sm">
                {option.label}
              </label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
