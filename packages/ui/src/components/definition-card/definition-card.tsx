import type { ReactNode } from 'react';
import { Badge } from '../../base/badge/badge';
import { cn } from '../../lib/utils';
import { AnchorLink, type LinkComponent } from '../link-component/link-component';

export interface DefinitionSense {
  it: string;
  en?: string | undefined;
  enTranslateStatus?: 'machine' | 'reviewed' | undefined;
}
export interface DefinitionExample {
  abr: string;
  it?: string | undefined;
  en?: string | null | undefined;
}
export type DefinitionTag = 'needs-review' | 'possible-duplicate';

/** Translated labels; the app supplies them so this package stays i18n-agnostic. */
export interface DefinitionLabels {
  meanings: string;
  examples: string;
  grammarNotes: string;
  variants: string;
  pronunciation: string;
  locality: string;
  needsReview: string;
  possibleDuplicate: string;
  noEnglish: string;
  unverifiedTranslation: string;
  /** Shown instead of the meaning list for entries with no parsed meaning yet. */
  awaitingReview: string;
}

export interface DefinitionCardProps {
  headword: string;
  article?: string | undefined;
  variants?: readonly string[] | undefined;
  pronunciation?: string | undefined;
  locality?: readonly string[] | undefined;
  senses: readonly DefinitionSense[];
  examples?: readonly DefinitionExample[] | undefined;
  grammarNotes?: readonly string[] | undefined;
  tags?: readonly DefinitionTag[] | undefined;
  labels: DefinitionLabels;
  /** summary: compact result card; full: entry page with examples and notes. */
  variant?: 'summary' | 'full';
  headingLevel?: 1 | 2 | 3;
  /** When set, the headword links here (summary cards). */
  href?: string | undefined;
  Link?: LinkComponent;
  /** Show English glosses and the "no English" badge. */
  showEnglish?: boolean;
  /** Footer slot, e.g. source and edit links. */
  children?: ReactNode;
  className?: string;
}

export function DefinitionCard({
  headword,
  article,
  variants,
  pronunciation,
  locality,
  senses,
  examples,
  grammarNotes,
  tags,
  labels,
  variant = 'summary',
  headingLevel = 3,
  href,
  Link = AnchorLink,
  showEnglish = false,
  children,
  className,
}: DefinitionCardProps) {
  const Heading = headingLevel === 1 ? 'h1' : headingLevel === 2 ? 'h2' : 'h3';
  // Section headings sit one level below the headword, so the outline never skips a level.
  const SectionHeading = headingLevel === 1 ? 'h2' : headingLevel === 2 ? 'h3' : 'h4';
  const isStub = senses.length === 0;
  const full = variant === 'full';
  // Only the entry page labels its meaning list as a region; in a list of result cards the same
  // label would repeat as one landmark per card.
  const Meanings = full ? 'section' : 'div';
  const hasEnglish = senses.some((s) => s.en);
  const title = article ? (
    <>
      <span className="font-normal text-muted-foreground">{article}</span>
      {` ${headword}`}
    </>
  ) : (
    headword
  );

  return (
    <article
      className={cn(
        'rounded-lg border border-border bg-card p-5 text-card-foreground',
        !full && 'transition-shadow hover:shadow-md',
        className,
      )}
    >
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Heading
          className={cn('font-heading font-semibold text-primary', full ? 'text-3xl' : 'text-xl')}
        >
          {href ? (
            <Link href={href} className="hover:underline">
              {title}
            </Link>
          ) : (
            title
          )}
        </Heading>
        {pronunciation ? (
          <span className="text-sm text-muted-foreground">
            <span className="sr-only">{labels.pronunciation}: </span>[{pronunciation}]
          </span>
        ) : null}
        {tags?.includes('needs-review') ? (
          <Badge variant="outline">{labels.needsReview}</Badge>
        ) : null}
        {tags?.includes('possible-duplicate') ? (
          <Badge variant="outline">{labels.possibleDuplicate}</Badge>
        ) : null}
        {showEnglish && !hasEnglish && !isStub ? (
          <Badge variant="secondary">{labels.noEnglish}</Badge>
        ) : null}
      </header>

      {variants && variants.length > 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="sr-only">{labels.variants}: </span>
          {variants.join(', ')}
        </p>
      ) : null}

      {isStub ? (
        <p className="mt-3 text-muted-foreground">{labels.awaitingReview}</p>
      ) : (
        <Meanings className="mt-3" {...(full ? { 'aria-label': labels.meanings } : {})}>
          <ol className={cn('space-y-1', senses.length > 1 && 'list-decimal pl-5')}>
            {senses.map((sense, i) => (
              <li key={i}>
                <span lang="it">{sense.it}</span>
                {showEnglish && sense.en ? (
                  <span className="text-muted-foreground">
                    {' '}
                    <span aria-hidden="true">·</span> <span lang="en">{sense.en}</span>
                    {sense.enTranslateStatus === 'machine' ? (
                      <Badge variant="outline" className="ml-2 align-middle">
                        {labels.unverifiedTranslation}
                      </Badge>
                    ) : null}
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </Meanings>
      )}

      {locality && locality.length > 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {labels.locality}: {locality.join(', ')}
        </p>
      ) : null}

      {full && examples && examples.length > 0 ? (
        <section className="mt-4" aria-label={labels.examples}>
          <SectionHeading className="text-sm font-semibold text-muted-foreground uppercase">
            {labels.examples}
          </SectionHeading>
          <ul className="mt-1 space-y-2">
            {examples.map((ex, i) => (
              <li key={i}>
                <q className="font-heading italic">{ex.abr}</q>
                {ex.it ? (
                  <span lang="it" className="block text-muted-foreground">
                    {ex.it}
                  </span>
                ) : null}
                {showEnglish && ex.en ? (
                  <span lang="en" className="block text-muted-foreground">
                    {ex.en}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {full && grammarNotes && grammarNotes.length > 0 ? (
        <section className="mt-4" aria-label={labels.grammarNotes}>
          <SectionHeading className="text-sm font-semibold text-muted-foreground uppercase">
            {labels.grammarNotes}
          </SectionHeading>
          <ul className="mt-1 space-y-1 text-sm">
            {grammarNotes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {children ? (
        <footer className="mt-4 border-t border-border pt-3 text-sm">{children}</footer>
      ) : null}
    </article>
  );
}
