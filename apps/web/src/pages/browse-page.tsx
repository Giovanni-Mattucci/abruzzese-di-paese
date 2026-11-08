import { Button, DefinitionCard, LetterNav } from '@mannaggia/ui';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useSearchParams } from 'react-router';
import { useDefinitionLabels } from '../app/labels';
import { RouterLink } from '../app/router-link';
import { BROWSE_PAGE_SIZE } from '../config';
import { useDictionary } from '../data/context';
import { useDocumentTitle } from '../hooks/use-document-title';

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

  const pages = entries ? Math.max(1, Math.ceil(entries.length / BROWSE_PAGE_SIZE)) : 1;
  const page = Math.min(pages, Math.max(1, Number(params.get('page')) || 1));
  const slice = entries?.slice((page - 1) * BROWSE_PAGE_SIZE, page * BROWSE_PAGE_SIZE) ?? [];

  return (
    <>
      <h1 className="font-heading text-3xl font-semibold text-primary">{title}</h1>
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
            {t('browse.page_of', { page, pages })}
          </p>
          <ul className="mt-4 space-y-3">
            {slice.map((entry) => (
              <li key={entry.id}>
                <DefinitionCard
                  headword={entry.headword}
                  article={entry.article}
                  variants={entry.variants}
                  pronunciation={entry.pronunciation}
                  locality={entry.locality}
                  senses={entry.senses}
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
          {pages > 1 ? (
            <nav
              aria-label={t('browse.pagination_label')}
              className="mt-6 flex items-center justify-between"
            >
              <Button asChild variant="outline" className={page <= 1 ? 'invisible' : ''}>
                <Link to={`/browse/${letter}?page=${page - 1}`}>{t('browse.previous')}</Link>
              </Button>
              <span className="text-sm text-muted-foreground">
                {t('browse.page_of', { page, pages })}
              </span>
              <Button asChild variant="outline" className={page >= pages ? 'invisible' : ''}>
                <Link to={`/browse/${letter}?page=${page + 1}`}>{t('browse.next')}</Link>
              </Button>
            </nav>
          ) : null}
        </>
      ) : null}
    </>
  );
}
