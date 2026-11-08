import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Button } from './button';

describe('Button (project)', () => {
  it('applies the Lexicon style over the base variant classes', () => {
    render(
      <Button variant="outline" size="sm">
        Browse
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Browse' });
    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(button).toHaveClass('rounded-none', 'shadow-none', 'text-xs', 'uppercase');
    expect(button).not.toHaveClass('rounded-md', 'shadow-xs', 'text-sm');
  });

  it('lets a caller class win over the Lexicon style', () => {
    render(<Button className="mt-6 tracking-normal">Home</Button>);
    const button = screen.getByRole('button', { name: 'Home' });
    expect(button).toHaveClass('mt-6', 'tracking-normal');
    expect(button).not.toHaveClass('tracking-[0.18em]');
  });

  it('renders its child element when asChild is set', () => {
    render(
      <Button asChild>
        <a href="/">Home</a>
      </Button>,
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveClass('uppercase');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <Button>Search</Button>
        <Button variant="ghost" aria-pressed="false">
          Italiano
        </Button>
      </main>,
    );
    await expectNoA11yViolations(container);
  });
});
