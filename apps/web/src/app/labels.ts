import type { DefinitionLabels } from '@mannaggia/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useDefinitionLabels(): DefinitionLabels {
  const { t } = useTranslation();
  return useMemo(
    () => ({
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
    }),
    [t],
  );
}
