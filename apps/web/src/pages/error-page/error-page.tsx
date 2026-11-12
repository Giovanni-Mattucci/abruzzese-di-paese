import { Button } from '@mannaggia/ui';
import { useTranslation } from 'react-i18next';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

export function ErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-16">
      <h1>{notFound ? t('common.not_found_title') : t('common.error_title')}</h1>
      {!notFound ? <p className="mt-3">{t('common.error_body')}</p> : null}
      <Button asChild className="mt-6">
        <Link to="/">{t('common.go_to_search')}</Link>
      </Button>
    </main>
  );
}
