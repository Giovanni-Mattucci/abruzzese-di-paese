import { useTranslation } from 'react-i18next';
import { REPO_URL, SOURCE_INDEX_URL } from '../config';
import { useDocumentTitle } from '../hooks/use-document-title';

export function AboutPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('about.title'));
  return (
    <>
      <h1 className="font-heading text-3xl font-semibold text-primary">{t('about.title')}</h1>
      <div className="mt-4 space-y-4 text-lg">
        <p>{t('about.what')}</p>
        <p>
          {t('about.source')}{' '}
          <a className="text-primary underline" href={SOURCE_INDEX_URL}>
            {t('footer.source_name')}
          </a>
        </p>
        <p>{t('about.contribute')}</p>
        <p>{t('about.licences')}</p>
        <p>
          <a className="text-primary underline" href={REPO_URL}>
            {t('about.github')}
          </a>
        </p>
      </div>
    </>
  );
}
