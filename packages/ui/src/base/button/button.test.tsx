import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Button } from './button';

describe('Button', () => {
  it('renders a native button with the default variant', () => {
    render(<Button>Search</Button>);
    const button = screen.getByRole('button', { name: 'Search' });
    expect(button).toHaveAttribute('data-variant', 'default');
    expect(button).toHaveClass('bg-primary');
  });

  it('applies variant and size', () => {
    render(
      <Button variant="outline" size="sm">
        Browse
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Browse' });
    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(button).toHaveAttribute('data-size', 'sm');
  });

  it('renders its child element when asChild is set', () => {
    render(
      <Button asChild>
        <a href="/browse/a">Letter A</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Letter A' });
    expect(link).toHaveAttribute('data-slot', 'button');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <Button>Search</Button>
        <Button variant="secondary" disabled>
          Disabled
        </Button>
      </main>,
    );
    await expectNoA11yViolations(container);
  });
});
