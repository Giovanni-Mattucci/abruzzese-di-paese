/**
 * Public surface of @mannaggia/ui. Apps import ONLY from here.
 * Every component lives in its own folder, <name>/<name>.tsx:
 * - ./base: shadcn-generated base components, written only by `pnpm ui:add`. They may be
 *   replaced wholesale by a future design system.
 * - ./components: hand-written project components that keep a stable API on top of them.
 */
export { cn } from './lib/utils';

// Base components (shadcn-generated, owned by this repo; listed in registry.json)
export { Badge, badgeVariants } from './base/badge/badge';
export { Button, buttonVariants } from './base/button/button';
export { Input } from './base/input/input';

// Project components
export {
  DefinitionCard,
  type DefinitionCardProps,
  type DefinitionExample,
  type DefinitionLabels,
  type DefinitionSense,
  type DefinitionTag,
} from './components/definition-card/definition-card';
export {
  DirectionToggle,
  type DirectionOption,
  type DirectionToggleProps,
} from './components/direction-toggle/direction-toggle';
export { LetterNav, type LetterNavProps } from './components/letter-nav/letter-nav';
export {
  AnchorLink,
  type LinkComponent,
  type LinkLikeProps,
} from './components/link-component/link-component';
export { SearchInput, type SearchInputProps } from './components/search-input/search-input';
export { SkipLink, type SkipLinkProps } from './components/skip-link/skip-link';
export {
  VisuallyHidden,
  type VisuallyHiddenProps,
} from './components/visually-hidden/visually-hidden';
