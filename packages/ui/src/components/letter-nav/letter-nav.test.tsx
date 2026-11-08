import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { LetterNav } from './letter-nav';
import type { LinkComponent } from '../link-component/link-component';

describe('LetterNav', () => {
  it('renders one link per letter and marks the current one', () => {
    render(
      <LetterNav
        label="Letters"
        letters={['a', 'b']}
        current="b"
        hrefFor={(l) => `/browse/${l}`}
      />,
    );
    expect(screen.getByRole('navigation', { name: 'Letters' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'a' })).toHaveAttribute('href', '/browse/a');
    expect(screen.getByRole('link', { name: 'b' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'a' })).not.toHaveAttribute('aria-current');
  });

  it('uses the supplied link component', () => {
    const Custom: LinkComponent = ({ href, children }) => (
      <a href={href} data-custom="yes">
        {children}
      </a>
    );
    render(<LetterNav label="Letters" letters={['z']} hrefFor={(l) => `/${l}`} Link={Custom} />);
    expect(screen.getByRole('link', { name: 'z' })).toHaveAttribute('data-custom', 'yes');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <LetterNav label="Letters" letters={['a', 'b', 'c']} current="a" hrefFor={(l) => `/${l}`} />
      </main>,
    );
    await expectNoA11yViolations(container);
  });
});
