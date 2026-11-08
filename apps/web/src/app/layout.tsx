import { SkipLink } from '@mannaggia/ui';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, Outlet } from 'react-router';
import { SOURCE_INDEX_URL } from '../config';
import { DictionaryProvider } from '../data/dictionary-provider';
import type { Dictionary } from '../data/dictionary';
import { LocaleToggle } from './locale-toggle';
import { useRouteFocus } from './use-route-focus';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${
    isActive ? 'bg-accent text-accent-foreground' : ''
  }`;

export function Layout({ dictionaryPromise }: { dictionaryPromise?: Promise<Dictionary> }) {
  const { t } = useTranslation();
  const providerProps = dictionaryPromise ? { promise: dictionaryPromise } : {};
  useRouteFocus('main');
  return (
    <>
      <SkipLink>{t('nav.skip_to_content')}</SkipLink>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to="/" className="font-heading text-xl font-semibold text-primary">
            {t('app.name')}
          </Link>
          <nav aria-label={t('nav.label')} className="flex flex-wrap items-center gap-1">
            <NavLink to="/" end className={navClass}>
              {t('nav.search')}
            </NavLink>
            <NavLink to="/browse" className={navClass}>
              {t('nav.browse')}
            </NavLink>
            <NavLink to="/grammar" className={navClass}>
              {t('nav.grammar')}
            </NavLink>
            <NavLink to="/about" className={navClass}>
              {t('nav.about')}
            </NavLink>
          </nav>
          <LocaleToggle />
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-8 outline-none">
        <Suspense fallback={<p role="status">{t('common.loading')}</p>}>
          <DictionaryProvider {...providerProps}>
            <Outlet />
          </DictionaryProvider>
        </Suspense>
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-6 text-sm text-muted-foreground">
          {t('footer.attribution')}{' '}
          <a className="text-primary underline" href={SOURCE_INDEX_URL}>
            {t('footer.source_name')}
          </a>
          . {t('footer.licences')}
        </div>
      </footer>
    </>
  );
}
