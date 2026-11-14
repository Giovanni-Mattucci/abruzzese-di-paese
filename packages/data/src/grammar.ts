import { Marked } from 'marked';

/** The only places a grammar link or image may point: the web, a mail address, or the same page. */
const SAFE_URL = /^(https?:\/\/|mailto:|#)/i;

/**
 * Turns grammar/regole.md into the HTML fragment of the grammar page, without its title lines.
 *
 * The web app injects this fragment as HTML, so a contributed edit must not be able to carry a
 * script, an event handler or a frame. Raw HTML in the Markdown is dropped, so the page can only
 * contain what Markdown itself produces, and every link is checked as a parsed token against an
 * allow-list. Checking the rendered HTML instead would miss a scheme hidden behind a character
 * reference, such as "&#106;avascript:".
 */
export function renderGrammar(source: string): string {
  // Collected, not thrown inside marked: it would add "please report this to marked" to the error.
  const refused: string[] = [];
  const markdown = new Marked({
    renderer: { html: () => '' },
    walkTokens(token) {
      if ((token.type === 'link' || token.type === 'image') && !SAFE_URL.test(token.href)) {
        refused.push(token.href);
      }
    },
  });
  const body = source.replace(/^# .*\n+(Source: .*\n+)?/, '');
  const html = markdown.parse(body, { async: false });
  if (refused.length > 0) {
    throw new Error(
      `grammar: links must start with https://, mailto: or #, but found: ${refused.join(', ')}`,
    );
  }
  return html;
}
