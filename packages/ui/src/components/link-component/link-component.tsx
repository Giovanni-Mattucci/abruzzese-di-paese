import type { ComponentType, ReactNode } from 'react';

/** Props a link adapter must accept so components stay router-agnostic. */
export interface LinkLikeProps {
  href: string;
  className?: string;
  children: ReactNode;
  'aria-current'?: 'page' | undefined;
}

export type LinkComponent = ComponentType<LinkLikeProps>;

/** Default adapter: a plain anchor. Apps pass a router-aware adapter instead. */
export const AnchorLink: LinkComponent = ({ href, className, children, ...rest }) => (
  <a href={href} className={className} {...rest}>
    {children}
  </a>
);
