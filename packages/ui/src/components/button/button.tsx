import type { ComponentProps } from 'react';
import { Button as BaseButton } from '../../base/button/button';
import { cn } from '../../lib/utils';

export type ButtonProps = ComponentProps<typeof BaseButton>;

/**
 * The project's Button: the shadcn Button in the Lexicon style (square, flat, small letter-spaced
 * capitals). The base file stays as shadcn ships it, so `pnpm ui:add button --force` can refresh
 * it without losing this look.
 */
export function Button({ className, ...props }: ButtonProps) {
  return (
    <BaseButton
      className={cn(
        'rounded-none font-body text-xs font-normal tracking-[0.18em] uppercase shadow-none',
        className,
      )}
      {...props}
    />
  );
}
