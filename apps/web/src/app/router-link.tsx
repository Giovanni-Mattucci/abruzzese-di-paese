import type { LinkComponent } from '@mannaggia/ui';
import { Link } from 'react-router';

/** Adapts @mannaggia/ui's router-agnostic link contract to react-router. */
export const RouterLink: LinkComponent = ({ href, className, children, ...rest }) => (
  <Link to={href} className={className} {...rest}>
    {children}
  </Link>
);
