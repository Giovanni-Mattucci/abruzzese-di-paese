import { cn } from '../../lib/utils';
import { AnchorLink, type LinkComponent } from '../link-component/link-component';

export interface LetterNavProps {
  /** Accessible name of the navigation landmark. */
  label: string;
  letters: readonly string[];
  current?: string | undefined;
  hrefFor: (letter: string) => string;
  Link?: LinkComponent;
  className?: string;
}

/** Alphabet navigation; the current letter carries aria-current="page". */
export function LetterNav({
  label,
  letters,
  current,
  hrefFor,
  Link = AnchorLink,
  className,
}: LetterNavProps) {
  return (
    <nav aria-label={label} className={className}>
      <ul className="flex flex-wrap gap-1">
        {letters.map((letter) => {
          const isCurrent = letter === current;
          return (
            <li key={letter}>
              <Link
                href={hrefFor(letter)}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'inline-flex size-9 items-center justify-center border-b-2 font-heading text-base uppercase hover:bg-accent',
                  isCurrent
                    ? 'border-primary text-primary'
                    : 'border-transparent hover:text-primary',
                )}
              >
                {letter}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
