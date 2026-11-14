import { describe, expect, it } from 'vitest';
import { renderGrammar } from './grammar';

describe('renderGrammar', () => {
  it('renders Markdown and leaves out the title and source lines', () => {
    const html = renderGrammar('# Title\n\nSource: somewhere\n\n## Metafonie\n\nUna *regola*.\n');
    expect(html).toContain('<h2>Metafonie</h2>');
    expect(html).toContain('<em>regola</em>');
    expect(html).not.toContain('Title');
    expect(html).not.toContain('Source:');
  });

  it('drops raw HTML, block and inline', () => {
    const html = renderGrammar(
      'Testo <img src=x onerror="alert(1)"> qui.\n\n<script>alert(1)</script>\n\n<!-- nota -->\n',
    );
    expect(html).not.toMatch(/<img|<script|onerror|nota/);
    expect(html).toContain('Testo');
  });

  it('allows only web, mail and same-page links', () => {
    expect(renderGrammar('[qui](https://www.abruzzo.fm/)')).toContain('href="https://');
    expect(renderGrammar('[su](#metafonie)')).toContain('href="#metafonie"');
    expect(renderGrammar('<mailto:radio@example.test>')).toContain('href="mailto:');
  });

  it.each([
    '[qui](javascript:alert(1))',
    '[qui](JAVASCRIPT:alert(1))',
    // The HTML parser decodes the reference and drops the tab, so both are javascript: links.
    '[qui](&#106;avascript:alert(1))',
    '[qui](java&#9;script:alert(1))',
    '[qui](data:text/html,x)',
    '[qui](/altrove)',
    '![img](javascript:alert(1))',
  ])('refuses %s', (source) => {
    expect(() => renderGrammar(source)).toThrow('must start with');
  });
});
