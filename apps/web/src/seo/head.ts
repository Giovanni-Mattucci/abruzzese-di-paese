import type { DictionaryEntry } from '@adp/data';

export interface PageHead {
  title: string;
  description: string;
  /** Path relative to the site root, starting with "/". */
  path: string;
  jsonLd?: Record<string, unknown>;
  /** Keep out of search indexes and the sitemap (unreviewed stubs, the 404 page). */
  noindex?: boolean;
}

export const SITE_NAME = 'Abruzzese di paese';
const SITE_DESCRIPTION =
  'A searchable, open-source dictionary of the Abruzzese dialect with Italian and English meanings.';

function truncate(text: string, max = 160): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

export function homeHead(entryCount: number, siteUrl: string): PageHead {
  return {
    title: SITE_NAME,
    description: `${SITE_DESCRIPTION} ${entryCount} words from the Treppecore archive.`,
    path: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: SITE_NAME,
          url: siteUrl,
          inLanguage: ['en', 'it'],
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/?q={search_term_string}` },
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@type': 'DefinedTermSet',
          '@id': `${siteUrl}/#termset`,
          name: `${SITE_NAME}: Abruzzese dialect dictionary`,
          url: siteUrl,
          license: 'https://creativecommons.org/licenses/by-sa/4.0/',
          distribution: {
            '@type': 'DataDownload',
            encodingFormat: 'application/json',
            contentUrl: `${siteUrl}/data/dictionary.json`,
          },
        },
      ],
    },
  };
}

export function entryHead(entry: DictionaryEntry, siteUrl: string): PageHead {
  const italian = entry.senses.map((s) => s.it).join('; ');
  const english = entry.senses.flatMap((s) => (s.en ? [s.en] : [])).join('; ');
  // Unparsed stubs have no meaning yet: describe them honestly and keep them out of indexes.
  const isStub = italian === '';
  const description = truncate(
    isStub
      ? `"${entry.headword}" in the Abruzzese dialect dictionary. This entry is awaiting review.`
      : english
        ? `${entry.headword}: ${italian}. English: ${english}.`
        : `${entry.headword}: ${italian}.`,
  );
  return {
    title: `${entry.headword} · ${SITE_NAME}`,
    description,
    path: `/word/${entry.id}`,
    ...(isStub ? { noindex: true } : {}),
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'DefinedTerm',
      '@id': `${siteUrl}/word/${entry.id}`,
      name: entry.headword,
      termCode: entry.id,
      ...(isStub ? {} : { description: italian }),
      ...(english ? { alternateName: english } : {}),
      inDefinedTermSet: `${siteUrl}/#termset`,
      url: `${siteUrl}/word/${entry.id}`,
    },
  };
}

export function browseHead(letter: string, count: number): PageHead {
  const upper = letter.toUpperCase();
  return {
    title: `Words starting with ${upper} · ${SITE_NAME}`,
    description: truncate(
      `${count} Abruzzese dialect words starting with ${upper}, with Italian and English meanings.`,
    ),
    path: `/browse/${letter}`,
  };
}

export function staticHead(path: '/browse' | '/grammar' | '/about'): PageHead {
  switch (path) {
    case '/browse':
      return {
        title: `Browse by letter · ${SITE_NAME}`,
        description: 'Browse the Abruzzese dialect dictionary letter by letter.',
        path,
      };
    case '/grammar':
      return {
        title: `The rules of the Abruzzese dialect · ${SITE_NAME}`,
        description:
          'Phonology, metaphony and morphology of the Abruzzese dialect, from the Treppecore archive.',
        path,
      };
    case '/about':
      return { title: `About · ${SITE_NAME}`, description: SITE_DESCRIPTION, path };
  }
}

/** Served by GitHub Pages for unknown paths; the client router renders the not-found page. */
export function notFoundHead(): PageHead {
  return {
    title: `Page not found · ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    path: '/404',
    noindex: true,
  };
}

/**
 * Six-character JSON escape for "<" (backslash, "u003c"). Built from a char code so no tool or
 * editor can collapse a backslash escape in source back into a literal "<".
 */
export const JSON_LT_ESCAPE = `${String.fromCharCode(92)}u003c`;

/** JSON safe to embed in an HTML script element: no "<" survives, so "</script>" cannot appear. */
export function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, JSON_LT_ESCAPE);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Head tags for one page. JSON-LD is serialised with "<" escaped so it can never close the script. */
export function headTags(head: PageHead, siteUrl: string, baseUrl: string): string {
  const url = `${siteUrl}${head.path}`;
  const tags = [
    `<title>${escapeHtml(head.title)}</title>`,
    `<meta name="description" content="${escapeHtml(head.description)}">`,
    `<link rel="alternate" type="application/json" href="${escapeHtml(`${baseUrl}data/dictionary.json`)}">`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}">`,
    `<meta property="og:type" content="${head.path.startsWith('/word/') ? 'article' : 'website'}">`,
    `<meta property="og:title" content="${escapeHtml(head.title)}">`,
    `<meta property="og:description" content="${escapeHtml(head.description)}">`,
    `<meta property="og:url" content="${escapeHtml(url)}">`,
    `<meta property="og:locale" content="en_GB">`,
    `<meta property="og:locale:alternate" content="it_IT">`,
  ];
  // A canonical URL tells search engines which address to index, so noindex pages (stubs and the
  // 404 shell, whose path is not a real page) carry none.
  if (head.noindex) tags.push('<meta name="robots" content="noindex">');
  else tags.splice(2, 0, `<link rel="canonical" href="${escapeHtml(url)}">`);
  if (head.jsonLd) {
    tags.push(`<script type="application/ld+json">${jsonForScript(head.jsonLd)}</script>`);
  }
  return tags.join('\n    ');
}
