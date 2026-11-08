import { Button } from '@mannaggia/ui';
import { useTranslation } from 'react-i18next';
import { applyLocale, isLocale, SUPPORTED_LOCALES, type Locale } from '../i18n';

/** Two-button language switch shown in the header on every page. */
export function LocaleToggle() {
  const { t, i18n } = useTranslation();
  const current: Locale = isLocale(i18n.language) ? i18n.language : 'en';
  return (
    <div
      role="group"
      aria-label={t('locale.label')}
      className="inline-flex rounded-md border border-border p-0.5"
    >
      {SUPPORTED_LOCALES.map((locale) => {
        const active = locale === current;
        return (
          <Button
            className="cursor-pointer"
            key={locale}
            type="button"
            size="sm"
            variant={active ? 'default' : 'ghost'}
            aria-pressed={active}
            lang={locale}
            onClick={() => {
              if (!active) applyLocale(i18n, locale, window.localStorage);
            }}
          >
            {t(`locale.${locale}`)}
          </Button>
        );
      })}
    </div>
  );
}
