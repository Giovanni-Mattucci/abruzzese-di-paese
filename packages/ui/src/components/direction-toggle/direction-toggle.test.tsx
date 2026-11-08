import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { DirectionToggle } from './direction-toggle';

const options = [
  { value: 'abr-it', label: 'Abruzzese to Italian' },
  { value: 'it-abr', label: 'Italian to Abruzzese' },
] as const;

describe('DirectionToggle', () => {
  it('renders a labelled radio group with the current value checked', () => {
    render(
      <DirectionToggle legend="Direction" options={options} value="it-abr" onChange={() => {}} />,
    );
    expect(screen.getByRole('radiogroup', { name: 'Direction' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Italian to Abruzzese' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Abruzzese to Italian' })).not.toBeChecked();
  });

  it('reports a change when another option is chosen', async () => {
    const onChange = vi.fn();
    render(
      <DirectionToggle legend="Direction" options={options} value="abr-it" onChange={onChange} />,
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Italian to Abruzzese' }));
    expect(onChange).toHaveBeenCalledWith('it-abr');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <DirectionToggle legend="Direction" options={options} value="abr-it" onChange={() => {}} />
      </main>,
    );
    await expectNoA11yViolations(container);
  });
});
