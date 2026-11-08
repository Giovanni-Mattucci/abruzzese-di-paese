import { Button } from '@mannaggia/ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useDocumentTitle } from '../hooks/use-document-title';

export function NotFoundPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('common.not_found_title'));
  return (
    <>
      <h1>{t('common.not_found_title')}</h1>
      <Button asChild className="mt-6">
        <Link to="/">{t('common.go_to_search')}</Link>
      </Button>
    </>
  );
}
