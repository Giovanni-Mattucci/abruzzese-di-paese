import { use } from 'react';
import { useTranslation } from 'react-i18next';
import { loadGrammar } from '../data/grammar';
import { useDocumentTitle } from '../hooks/use-document-title';
import { LinkIcon, VisuallyHidden } from '@mannaggia/ui';

export function GrammarPage({ promise = loadGrammar() }: { promise?: Promise<string> }) {
  const { t } = useTranslation();
  useDocumentTitle(t('grammar.title'));
  const html = use(promise);
  return (
    <>
      <h1>{t('grammar.title')}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t('grammar.intro')}{' '}
        <a
          href="https://www.abruzzo.fm/archivio/treppecore/regole.html"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex align-text-bottom text-primary hover:text-foreground"
        >
          <LinkIcon aria-hidden="true" className="size-4" />
          <VisuallyHidden>{t('grammar.source_link')}</VisuallyHidden>
        </a>
      </p>
      <div lang="it" className="prose-grammar mt-6" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
