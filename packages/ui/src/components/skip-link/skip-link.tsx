import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/utils';

export interface SkipLinkProps extends Omit<ComponentPropsWithoutRef<'a'>, 'href'> {
  /** Id of the main content landmark, without the leading hash. Defaults to "main". */
  targetId?: string;
}

/**
 * First focusable element on every page. Hidden until focused, then lets keyboard
 * users jump past navigation to the main landmark (WCAG 2.4.1 Bypass Blocks).
 */
export function SkipLink({ targetId = 'main', className, children, ...rest }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        'sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50',
        'focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground',
        className,
      )}
      {...rest}
    >
      {children ?? 'Skip to main content'}
    </a>
  );
}
