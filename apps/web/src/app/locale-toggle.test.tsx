import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import { createI18n } from '../i18n';
import { LocaleToggle } from './locale-toggle';

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.lang = 'en';
});

describe('LocaleToggle', () => {
  it('marks the current language as pressed', () => {
    render(
      <I18nextProvider i18n={createI18n('en')}>
        <LocaleToggle />
      </I18nextProvider>,
    );
    expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Italiano' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('switches language, persists it, and updates the document language', async () => {
    const i18n = createI18n('en');
    render(
      <I18nextProvider i18n={i18n}>
        <LocaleToggle />
      </I18nextProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Italiano' }));
    expect(i18n.language).toBe('it');
    expect(window.localStorage.getItem('locale')).toBe('it');
    expect(document.documentElement.lang).toBe('it');
    expect(screen.getByRole('group', { name: 'Lingua' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Italiano' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
