import type { DictionaryEntry } from '@adp/data';
import { DefinitionCard } from '@mannaggia/ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { RouterLink } from '../../app/router-link';

export interface EntryCardProps {
  entry: DictionaryEntry;
  /** summary: a result in a list, linking to the entry; full: the entry's own page. */
  variant?: 'summary' | 'full';
  /** Footer of the full card, e.g. source and edit links. */
  children?: ReactNode;
}

/** A dictionary entry shown with the design system's DefinitionCard and translated labels. */
export function EntryCard({ entry, variant = 'summary', children }: EntryCardProps) {
  const { t } = useTranslation();
  const full = variant === 'full';
  return (
    <DefinitionCard
      variant={variant}
      headingLevel={full ? 1 : 2}
      href={full ? undefined : `/word/${entry.id}`}
      Link={RouterLink}
      headword={entry.headword}
      article={entry.article}
      variants={entry.variants}
      pronunciation={entry.pronunciation}
      locality={entry.locality}
      senses={entry.senses}
      examples={entry.examples}
      grammarNotes={entry.grammarNotes}
      tags={entry.tags}
      showEnglish
      labels={{
        meanings: t('entry.meanings'),
        examples: t('entry.examples'),
        grammarNotes: t('entry.grammar_notes'),
        variants: t('entry.variants'),
        pronunciation: t('entry.pronunciation'),
        locality: t('entry.locality'),
        needsReview: t('entry.needs_review'),
        possibleDuplicate: t('entry.possible_duplicate'),
        noEnglish: t('entry.no_english'),
        unverifiedTranslation: t('entry.unverified_translation'),
        awaitingReview: t('entry.awaiting_review'),
      }}
    >
      {children}
    </DefinitionCard>
  );
}
