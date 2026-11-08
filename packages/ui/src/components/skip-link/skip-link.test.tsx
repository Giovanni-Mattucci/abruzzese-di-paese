import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { SkipLink } from './skip-link';

describe('SkipLink', () => {
  it('links to the main landmark by default', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: 'Skip to main content' });
    expect(link).toHaveAttribute('href', '#main');
  });

  it('accepts a custom target and label', () => {
    render(<SkipLink targetId="content">Salta al contenuto</SkipLink>);
    expect(screen.getByRole('link', { name: 'Salta al contenuto' })).toHaveAttribute(
      'href',
      '#content',
    );
  });

  it('is visually hidden until focused', async () => {
    render(<SkipLink />);
    const link = screen.getByRole('link');
    expect(link.className).toContain('sr-only');
    await userEvent.tab();
    expect(link).toHaveFocus();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <>
        <SkipLink />
        <main id="main">
          <h1>Title</h1>
        </main>
      </>,
    );
    await expectNoA11yViolations(container);
  });
});
