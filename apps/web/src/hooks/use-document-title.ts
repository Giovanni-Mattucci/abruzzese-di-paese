import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/** Sets "<title> · Abruzzese di paese", or just the app name when no title is given. */
export function useDocumentTitle(title?: string) {
  const { t } = useTranslation();
  useEffect(() => {
    const name = t('app.name');
    document.title = title ? `${title} · ${name}` : name;
  }, [title, t]);
}
