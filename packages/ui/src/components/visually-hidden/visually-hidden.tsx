import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { cn } from '../../lib/utils';

export type VisuallyHiddenProps<T extends ElementType = 'span'> = {
  /** Element to render; defaults to span. */
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'as'>;

/**
 * Renders content that is available to assistive technology but not shown on screen.
 * Use for labels and status text that sighted users infer from layout.
 */
export function VisuallyHidden<T extends ElementType = 'span'>({
  as,
  className,
  ...rest
}: VisuallyHiddenProps<T>) {
  const Component = (as ?? 'span') as ElementType;
  return <Component className={cn('sr-only', className)} {...rest} />;
}
