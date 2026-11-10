import { use } from 'react';
import { useTranslation } from 'react-i18next';
import { loadGrammar } from '../data/grammar';
import { useDocumentTitle } from '../hooks/use-document-title';

export function GrammarPage({ promise = loadGrammar() }: { promise?: Promise<string> }) {
  const { t } = useTranslation();
  useDocumentTitle(t('grammar.title'));
  const html = use(promise);
  return (
    <>
      <h1>{t('grammar.title')}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t('grammar.intro')}</p>
      <div lang="it" className="prose-grammar mt-6" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
