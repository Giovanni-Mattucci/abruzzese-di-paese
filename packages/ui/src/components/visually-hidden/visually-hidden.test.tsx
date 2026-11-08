import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VisuallyHidden } from './visually-hidden';

describe('VisuallyHidden', () => {
  it('renders a span with the sr-only class', () => {
    render(<VisuallyHidden>results updated</VisuallyHidden>);
    const el = screen.getByText('results updated');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveClass('sr-only');
  });

  it('renders a different element when asked', () => {
    render(<VisuallyHidden as="div">status</VisuallyHidden>);
    expect(screen.getByText('status').tagName).toBe('DIV');
  });
});
