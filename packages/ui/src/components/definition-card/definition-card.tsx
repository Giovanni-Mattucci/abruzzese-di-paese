import { ChevronRightIcon } from 'lucide-react';
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
  /** summary: compact result card; full: entry page with examples. Grammar notes show in both, collapsed. */
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

/**
 * BCP 47 tag for dictionary text in dialect. Abruzzese has no registered subtag of its own, so the
 * Italian primary subtag lets screen readers pick an Italian voice instead of the page language,
 * and the private-use suffix keeps the dialect distinguishable for machine readers.
 */
export const DIALECT_LANG = 'it-x-abruzzo';

/** Small letter-spaced capitals on the shadcn Badge, which keeps its own variant colours. */
const tagClass =
  'rounded-none px-1.5 font-body text-[0.625rem] leading-[calc(4/3)] font-normal tracking-[0.18em] uppercase';

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
  // <dfn> marks the defining instance of the term; each card is its own article, so it is the
  // definition's scope. The article ("la") is grammar, not part of the term, so it stays outside.
  const term = <dfn className="not-italic">{headword}</dfn>;
  const title = article ? (
    <>
      <span className="font-normal text-muted-foreground">{article}</span> {term}
    </>
  ) : (
    term
  );

  return (
    // Flat entries separated by hairlines; the entry page drops the rule and the top padding.
    <article className={cn('text-card-foreground', full ? 'pb-5' : 'border-b py-5', className)}>
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Heading
          lang={DIALECT_LANG}
          className={cn(
            'font-heading font-normal tracking-tight text-foreground',
            full ? 'text-5xl sm:text-6xl' : 'text-2xl',
          )}
        >
          {href ? (
            <Link
              href={href}
              className="text-foreground decoration-primary decoration-1 underline-offset-4 hover:underline"
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </Heading>
        {pronunciation ? (
          <span className="text-sm tracking-wide text-primary">
            <span className="sr-only">{labels.pronunciation}: </span>[{pronunciation}]
          </span>
        ) : null}
        {tags?.includes('needs-review') ? (
          <Badge variant="outline" className={tagClass}>
            {labels.needsReview}
          </Badge>
        ) : null}
        {tags?.includes('possible-duplicate') ? (
          <Badge variant="outline" className={tagClass}>
            {labels.possibleDuplicate}
          </Badge>
        ) : null}
        {showEnglish && !hasEnglish && !isStub ? (
          <Badge variant="secondary" className={tagClass}>
            {labels.noEnglish}
          </Badge>
        ) : null}
      </header>

      {variants && variants.length > 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="sr-only">{labels.variants}: </span>
          <span lang={DIALECT_LANG}>{variants.join(', ')}</span>
        </p>
      ) : null}

      {isStub ? (
        <p className="mt-3 text-muted-foreground">{labels.awaitingReview}</p>
      ) : (
        <Meanings className="mt-3" {...(full ? { 'aria-label': labels.meanings } : {})}>
          <ol
            className={cn(
              'space-y-3 leading-relaxed marker:font-heading marker:text-primary',
              senses.length > 1 && 'list-decimal pl-5',
              full && 'mt-6 border-t pt-6 text-lg',
            )}
          >
            {senses.map((sense, i) => (
              <li key={i}>
                <span lang="it">{sense.it}</span>
                {showEnglish && sense.en ? (
                  <span className="text-muted-foreground">
                    {' '}
                    <span aria-hidden="true">·</span> <span lang="en">{sense.en}</span>
                    {sense.enTranslateStatus === 'machine' ? (
                      <Badge variant="outline" className={cn(tagClass, 'ml-2 align-middle')}>
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

      {grammarNotes && grammarNotes.length > 0 ? (
        // A native disclosure: collapsed by default, opened by click, Enter or Space, announced
        // as expandable by screen readers, and it works in prerendered HTML before hydration.
        <details className="group mt-2 text-sm text-muted-foreground">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-sm hover:text-foreground [&::-webkit-details-marker]:hidden">
            <ChevronRightIcon
              aria-hidden="true"
              className="size-4 transition-transform group-open:rotate-90 motion-reduce:transition-none"
            />
            {labels.grammarNotes}
          </summary>
          <ul className="mt-1 ml-2 space-y-1 border-l border-border pl-3">
            {grammarNotes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </details>
      ) : null}

      {locality && locality.length > 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {labels.locality}: {locality.join(', ')}
        </p>
      ) : null}

      {full && examples && examples.length > 0 ? (
        <section className="mt-4" aria-label={labels.examples}>
          <SectionHeading className="font-body text-xs font-normal tracking-[0.18em] text-muted-foreground uppercase">
            {labels.examples}
          </SectionHeading>
          <ul className="mt-1 space-y-2">
            {examples.map((ex, i) => (
              <li key={i} className="border-l pl-4 text-muted-foreground">
                <q lang={DIALECT_LANG} className="font-body text-lg text-foreground italic">
                  {ex.abr}
                </q>
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

      {children ? (
        <footer className="mt-8 border-t border-border pt-3 text-sm">{children}</footer>
      ) : null}
    </article>
  );
}
