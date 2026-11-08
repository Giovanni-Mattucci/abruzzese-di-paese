import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { DefinitionCard, type DefinitionLabels } from './definition-card';

const labels: DefinitionLabels = {
  meanings: 'Meaning',
  examples: 'Examples',
  grammarNotes: 'Grammar notes',
  variants: 'Variants',
  pronunciation: 'Pronunciation',
  locality: 'Attested in',
  needsReview: 'Needs review',
  possibleDuplicate: 'Possible duplicate',
  noEnglish: 'No English yet',
  unverifiedTranslation: 'Unverified translation',
  awaitingReview: 'This entry is awaiting review.',
};

describe('DefinitionCard', () => {
  it('renders a linked headword with article, variants and senses', () => {
    render(
      <DefinitionCard
        headword="ardeca"
        article="la"
        variants={['ardeche']}
        senses={[{ it: 'ortica' }]}
        labels={labels}
        href="/word/a-ardeca"
      />,
    );
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'la ardeca' })).toHaveAttribute(
      'href',
      '/word/a-ardeca',
    );
    expect(screen.getByText('ardeche')).toBeInTheDocument();
    expect(screen.getByText('ortica')).toHaveAttribute('lang', 'it');
  });

  it('shows tags as badges', () => {
    render(
      <DefinitionCard
        headword="x"
        senses={[{ it: 'y' }]}
        labels={labels}
        tags={['needs-review', 'possible-duplicate']}
      />,
    );
    expect(screen.getByText('Needs review')).toBeInTheDocument();
    expect(screen.getByText('Possible duplicate')).toBeInTheDocument();
  });

  it('hides English until showEnglish is set, then flags unverified glosses', () => {
    const senses = [{ it: 'ortica', en: 'nettle', enTranslateStatus: 'machine' as const }];
    const { rerender } = render(
      <DefinitionCard headword="ardeca" senses={senses} labels={labels} />,
    );
    expect(screen.queryByText('nettle')).not.toBeInTheDocument();
    rerender(<DefinitionCard headword="ardeca" senses={senses} labels={labels} showEnglish />);
    expect(screen.getByText('nettle')).toHaveAttribute('lang', 'en');
    expect(screen.getByText('Unverified translation')).toBeInTheDocument();
  });

  it('shows the no-English badge only when English is on and missing', () => {
    render(<DefinitionCard headword="x" senses={[{ it: 'y' }]} labels={labels} showEnglish />);
    expect(screen.getByText('No English yet')).toBeInTheDocument();
  });

  it('renders examples only in the full variant, and grammar notes in both', () => {
    const props = {
      headword: 'abbijà',
      senses: [{ it: 'iniziare' }],
      examples: [{ abr: 'abbije a magnà', it: 'inizia a mangiare' }],
      grammarNotes: ['Passato remoto: j abbijve'],
      labels,
    };
    const { rerender } = render(<DefinitionCard {...props} />);
    expect(screen.queryByText('abbije a magnà')).not.toBeInTheDocument();
    expect(screen.getByText('Passato remoto: j abbijve')).toBeInTheDocument();
    rerender(<DefinitionCard {...props} variant="full" headingLevel={2} />);
    expect(screen.getByRole('heading', { level: 2, name: 'abbijà' })).toBeInTheDocument();
    expect(screen.getByText('abbije a magnà')).toBeInTheDocument();
    expect(screen.getByText('Passato remoto: j abbijve')).toBeInTheDocument();
  });

  it('collapses grammar notes under a "Grammar notes" toggle that opens on click', async () => {
    const user = userEvent.setup();
    render(
      <DefinitionCard
        headword="abbajà"
        senses={[{ it: 'abbaiare' }]}
        grammarNotes={['Presente: j abbaje', 'Passato: j abbajve']}
        labels={labels}
      />,
    );
    const toggle = screen.getByText('Grammar notes');
    const disclosure = toggle.closest('details');
    expect(toggle.tagName).toBe('SUMMARY');
    expect(disclosure).not.toHaveAttribute('open');
    await user.click(toggle);
    expect(disclosure).toHaveAttribute('open');
    expect(screen.getByText('Passato: j abbajve')).toBeVisible();
  });

  it('shows no grammar toggle when an entry has no grammar notes', () => {
    render(
      <DefinitionCard headword="abbadà" senses={[{ it: 'prestare attenzione' }]} labels={labels} />,
    );
    expect(screen.queryByText('Grammar notes')).not.toBeInTheDocument();
  });

  it('has no accessibility violations in either variant', async () => {
    const { container } = render(
      <main>
        <h1>Dictionary</h1>
        <DefinitionCard
          headword="a"
          senses={[{ it: 'b' }, { it: 'c' }]}
          labels={labels}
          href="/word/a-a"
        />
        <DefinitionCard
          headword="d"
          pronunciation="dee"
          locality={['Montebello sul Sangro']}
          senses={[{ it: 'e' }]}
          examples={[{ abr: 'f', it: 'g' }]}
          grammarNotes={['h']}
          labels={labels}
          variant="full"
          headingLevel={2}
          showEnglish
        >
          <a href="/x">Source</a>
        </DefinitionCard>
      </main>,
    );
    await expectNoA11yViolations(container);
  });

  it('puts section headings one level below the headword', () => {
    render(
      <DefinitionCard
        variant="full"
        headingLevel={1}
        headword="abbija"
        senses={[{ it: 'avviare' }]}
        examples={[{ abr: 'abbije a magna' }]}
        grammarNotes={['Passato remoto: j abbijve']}
        labels={labels}
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'abbija' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Examples' })).toBeInTheDocument();
    // Grammar notes are a collapsed disclosure, not a section heading.
    expect(screen.queryByRole('heading', { name: 'Grammar notes' })).not.toBeInTheDocument();
  });

  it('defaults to h3 headwords with h4 sections', () => {
    render(
      <DefinitionCard
        variant="full"
        headword="x"
        senses={[{ it: 'y' }]}
        examples={[{ abr: 'z' }]}
        labels={labels}
      />,
    );
    expect(screen.getByRole('heading', { level: 3, name: 'x' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Examples' })).toBeInTheDocument();
  });

  it('explains a stub entry instead of rendering an empty meaning list', () => {
    render(
      <DefinitionCard
        headword="a partarrete"
        senses={[]}
        tags={['needs-review']}
        labels={labels}
        showEnglish
      />,
    );
    expect(screen.getByText('This entry is awaiting review.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByText('No English yet')).not.toBeInTheDocument();
    expect(screen.getByText('Needs review')).toBeInTheDocument();
  });

  it('labels the meaning region only on the full card, so result lists repeat no landmark', () => {
    const { rerender } = render(
      <DefinitionCard headword="x" senses={[{ it: 'y' }]} labels={labels} />,
    );
    expect(screen.queryByRole('region', { name: 'Meaning' })).not.toBeInTheDocument();
    rerender(<DefinitionCard variant="full" headword="x" senses={[{ it: 'y' }]} labels={labels} />);
    expect(screen.getByRole('region', { name: 'Meaning' })).toBeInTheDocument();
  });
});
