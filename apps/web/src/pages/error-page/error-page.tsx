import { Button } from '@mannaggia/ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { isRouteErrorResponse, Link, useLocation, useNavigate, useRouteError } from 'react-router';
import { forgetFailedDictionary } from '../../data/dictionary';
import { forgetFailedGrammar } from '../../data/grammar';

export function ErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError();
  const location = useLocation();
  const navigate = useNavigate();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  // The failure is on screen now, so a failed fetch can be dropped: the next render, from
  // "Try again" or from any link, fetches afresh instead of meeting the same rejected promise.
  useEffect(() => {
    forgetFailedDictionary();
    forgetFailedGrammar();
  }, []);

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-16">
      <h1>{notFound ? t('common.not_found_title') : t('common.error_title')}</h1>
      {!notFound ? <p className="mt-3">{t('common.error_body')}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        {!notFound ? (
          // Navigating to the page already open clears the router's error and renders it again.
          <Button type="button" onClick={() => void navigate(location, { replace: true })}>
            {t('common.try_again')}
          </Button>
        ) : null}
        <Button asChild variant={notFound ? 'default' : 'outline'}>
          <Link to="/">{t('common.go_to_search')}</Link>
        </Button>
      </div>
    </main>
  );
}
