import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatTitle } from '../seo/head';

/** Sets "<title> · Abruzzese di paese", or just the app name when no title is given. */
export function useDocumentTitle(title?: string) {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = formatTitle(title, t('app.name'));
  }, [title, t]);
}
