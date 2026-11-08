import { DefinitionCard } from '@mannaggia/ui';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { useDefinitionLabels } from '../app/labels';
import { entryEditUrl, reportEntryUrl } from '../config';
import { useDictionary } from '../data/context';
import { useDocumentTitle } from '../hooks/use-document-title';

export function EntryPage() {
  const { t } = useTranslation();
  const labels = useDefinitionLabels();
  const dictionary = useDictionary();
  const { id = '' } = useParams();
  const entry = dictionary.byId.get(id);
  useDocumentTitle(entry?.headword ?? t('common.not_found_title'));

  if (!entry) {
    return (
      <>
        <h1 className="font-heading text-3xl text-primary">{t('common.not_found_title')}</h1>
        <p className="mt-3">{t('entry.not_found', { id })}</p>
        <Link className="mt-4 inline-block text-primary underline" to="/">
          {t('common.go_to_search')}
        </Link>
      </>
    );
  }

  const letter = entry.source.letter;
  return (
    <>
      <p className="mb-3 text-sm">
        <Link className="text-primary underline" to={`/browse/${letter}`}>
          {t('browse.letter_title', { letter: letter.toUpperCase() })}
        </Link>
      </p>
      <DefinitionCard
        variant="full"
        headingLevel={1}
        headword={entry.headword}
        article={entry.article}
        variants={entry.variants}
        pronunciation={entry.pronunciation}
        locality={entry.locality}
        senses={entry.senses}
        examples={entry.examples}
        grammarNotes={entry.grammarNotes}
        tags={entry.tags}
        labels={labels}
        showEnglish
      >
        <p>
          {t('entry.source')}:{' '}
          <a className="text-primary underline" href={entry.source.url}>
            {t('entry.source_link', { letter })}
          </a>
        </p>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <a className="text-primary underline" href={entryEditUrl(letter, entry.id)}>
            {t('entry.edit_on_github')}
          </a>
          <a className="text-primary underline" href={reportEntryUrl(entry.id)}>
            {t('entry.report_problem')}
          </a>
        </p>
      </DefinitionCard>
    </>
  );
}
