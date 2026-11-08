import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { SearchInput } from './search-input';

describe('SearchInput', () => {
  it('is a labelled search box that reports typed text', async () => {
    const onChange = vi.fn();
    render(<SearchInput id="q" label="Search the dictionary" value="" onChange={onChange} />);
    const box = screen.getByRole('searchbox', { name: 'Search the dictionary' });
    await userEvent.type(box, 'ar');
    expect(onChange).toHaveBeenLastCalledWith('r');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('exposes the status text in a polite live region', () => {
    render(
      <SearchInput id="q" label="Search" value="ar" onChange={() => {}} statusText="12 results" />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('12 results');
  });

  it('can hide the label visually', () => {
    render(<SearchInput id="q" label="Search" hideLabel value="" onChange={() => {}} />);
    expect(screen.getByText('Search')).toHaveClass('sr-only');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <SearchInput id="q" label="Search" value="" onChange={() => {}} statusText="" />
      </main>,
    );
    await expectNoA11yViolations(container);
  });
});
