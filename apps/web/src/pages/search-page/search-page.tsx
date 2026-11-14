import { DirectionToggle, LetterNav, SearchInput } from '@mannaggia/ui';
import { DIRECTIONS, type Direction } from '@adp/search';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigationType, useSearchParams } from 'react-router';
import { RouterLink } from '../../app/router-link';
import { EntryCard } from '../../components/entry-card/entry-card';
import { paginate } from '../../components/pagination/paginate';
import { Pagination } from '../../components/pagination/pagination';
import { helpTranslateUrl, SEARCH_PAGE_SIZE } from '../../config';
import { useDictionary } from '../../data/context';
import { useDocumentTitle } from '../../seo/use-document-title';

function isDirection(value: string | null): value is Direction {
  return value !== null && (DIRECTIONS as readonly string[]).includes(value);
}

export function SearchPage() {
  const { t } = useTranslation();
  const dictionary = useDictionary();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigationType = useNavigationType();

  // The box keeps its own text so typing is synchronous (the router updates the URL a tick later,
  // which would move the caret to the end). Typing writes the URL with replace navigations; any
  // other navigation (back, forward, a link to search) is external and resets the text from the URL.
  const urlQuery = params.get('q') ?? '';
  const [box, setBox] = useState({ key: location.key, text: urlQuery });
  if (box.key !== location.key) {
    setBox({ key: location.key, text: navigationType === 'REPLACE' ? box.text : urlQuery });
  }
  const query = box.key === location.key || navigationType === 'REPLACE' ? box.text : urlQuery;
  const rawDir = params.get('dir');
  const direction: Direction = isDirection(rawDir) ? rawDir : 'abr-it';

  useDocumentTitle(query ? `${query}` : undefined);

  const options = useMemo(
    () =>
      DIRECTIONS.map((d) => ({
        value: d,
        label: t(`search.direction.${d}`),
      })),
    [t],
  );

  const results = useMemo(
    () => dictionary.index.search(query, direction),
    [dictionary, query, direction],
  );
  const { page, pages, items: shown } = paginate(results, params.get('page'), SEARCH_PAGE_SIZE);

  const update = (next: { q?: string; dir?: Direction }) => {
    const q = next.q ?? query;
    if (next.q !== undefined) setBox((b) => ({ ...b, text: q }));
    const p = new URLSearchParams(params);
    if (q) p.set('q', q);
    else p.delete('q');
    if (next.dir !== undefined) p.set('dir', next.dir);
    // A new query or direction is a new result list, so it starts again at its first page.
    p.delete('page');
    setParams(p, { replace: true });
  };

  const statusText = query ? t('search.results_count', { count: results.length }) : '';

  return (
    <>
      <h1>{t('app.tagline')}</h1>
      <p className="mt-2 text-muted-foreground">
        {t('search.intro', { count: dictionary.entries.length })}
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <SearchInput
          id="search"
          label={t('search.label')}
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(q) => update({ q })}
          statusText={statusText}
        />
        <DirectionToggle
          legend={t('search.direction_label')}
          options={options}
          value={direction}
          onChange={(dir) => update({ dir })}
        />
      </div>

      {query ? (
        <section className="mt-8" aria-label={t('nav.search')}>
          <p className="text-sm text-muted-foreground">
            {statusText}
            {pages > 1 ? `. ${t('pagination.page_of', { page, pages })}` : null}
          </p>
          {results.length === 0 ? (
            <p className="mt-4">
              {direction === 'en' ? (
                <>
                  {t('search.no_results_en')}{' '}
                  <a className="text-primary underline" href={helpTranslateUrl()}>
                    {t('search.help_translate')}
                  </a>
                </>
              ) : (
                t('search.no_results', { query })
              )}
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {shown.map((r) => {
                const entry = dictionary.byId.get(String(r.id));
                if (!entry) return null;
                return (
                  <li key={entry.id}>
                    <EntryCard entry={entry} />
                  </li>
                );
              })}
            </ul>
          )}
          <Pagination
            page={page}
            pages={pages}
            hrefFor={(n) => {
              const p = new URLSearchParams(params);
              p.set('page', String(n));
              return `/?${p.toString()}`;
            }}
          />
        </section>
      ) : (
        <section className="mt-10">
          <h2 className="text-xl">{t('browse.title')}</h2>
          <LetterNav
            className="mt-3"
            label={t('browse.nav_label')}
            letters={dictionary.letters}
            hrefFor={(l) => `/browse/${l}`}
            Link={RouterLink}
          />
        </section>
      )}
    </>
  );
}
