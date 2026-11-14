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

  it('refuses a link with a script URL', () => {
    expect(() => renderGrammar('[qui](javascript:alert(1))')).toThrow('links must not use');
    expect(renderGrammar('[qui](https://www.abruzzo.fm/)')).toContain('href="https://');
  });
});
