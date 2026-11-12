import { useTranslation } from 'react-i18next';
import { analyticsEnabled, RADIO_ABRUZZO_URL, REPO_URL, SOURCE_INDEX_URL } from '../config';
import { useDocumentTitle } from '../hooks/use-document-title';

export function AboutPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('about.title'));
  return (
    <>
      <div className="content">
        <h1>{t('about.title')}</h1>
        <div className="mt-4 space-y-4 text-lg">
          <p>{t('about.what')}</p>
          <p>
            {t('about.source')} <a href={SOURCE_INDEX_URL}>{t('footer.source_name')}</a>
          </p>
          <p>
            {t('about.radio')} <a href={RADIO_ABRUZZO_URL}>{t('about.radio_link')}</a>
          </p>
          <p>{t('about.contribute')}</p>
          <p>{t('about.licences')}</p>
          <p>
            <a href={REPO_URL}>{t('about.github')}</a>
          </p>
        </div>
        <h2 className="mt-8">{t('about.privacy_title')}</h2>
        <p className="mt-4 text-lg">
          {analyticsEnabled() ? t('about.privacy_analytics') : t('about.privacy_none')}
        </p>
      </div>
    </>
  );
}
