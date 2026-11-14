import { DefinitionCard, LetterNav } from '@mannaggia/ui';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router';
import { useDefinitionLabels } from '../../app/labels';
import { RouterLink } from '../../app/router-link';
import { paginate } from '../../components/pagination/paginate';
import { Pagination } from '../../components/pagination/pagination';
import { BROWSE_PAGE_SIZE } from '../../config';
import { useDictionary } from '../../data/context';
import { useDocumentTitle } from '../../hooks/use-document-title';

export function BrowsePage() {
  const { t } = useTranslation();
  const labels = useDefinitionLabels();
  const dictionary = useDictionary();
  // Letters are stored lower-case; /browse/S shows the same page as /browse/s.
  const letter = useParams().letter?.toLowerCase();
  const [params] = useSearchParams();

  const entries = letter ? dictionary.byLetter.get(letter) : undefined;
  const title = letter
    ? t('browse.letter_title', { letter: letter.toUpperCase() })
    : t('browse.title');
  useDocumentTitle(title);

  const { page, pages, items } = paginate(entries ?? [], params.get('page'), BROWSE_PAGE_SIZE);

  return (
    <>
      <h1>{title}</h1>
      <LetterNav
        className="mt-4"
        label={t('browse.nav_label')}
        letters={dictionary.letters}
        current={letter}
        hrefFor={(l) => `/browse/${l}`}
        Link={RouterLink}
      />

      {letter && !entries ? <p className="mt-6">{t('browse.unknown_letter', { letter })}</p> : null}

      {entries ? (
        <>
          <p className="mt-6 text-sm text-muted-foreground">
            {t('browse.entries_count', { count: entries.length })}.{' '}
            {t('pagination.page_of', { page, pages })}
          </p>
          <ul className="mt-4 space-y-3">
            {items.map((entry) => (
              <li key={entry.id}>
                <DefinitionCard
                  headword={entry.headword}
                  article={entry.article}
                  variants={entry.variants}
                  pronunciation={entry.pronunciation}
                  locality={entry.locality}
                  senses={entry.senses}
                  grammarNotes={entry.grammarNotes}
                  tags={entry.tags}
                  labels={labels}
                  href={`/word/${entry.id}`}
                  Link={RouterLink}
                  headingLevel={2}
                  showEnglish
                />
              </li>
            ))}
          </ul>
          <Pagination page={page} pages={pages} hrefFor={(n) => `/browse/${letter}?page=${n}`} />
        </>
      ) : null}
    </>
  );
}
