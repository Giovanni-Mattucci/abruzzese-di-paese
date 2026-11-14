import { Marked } from 'marked';

/** The only places a grammar link or image may point: the web, a mail address, or the same page. */
const SAFE_URL = /^(https?:\/\/|mailto:|#)/i;

// The web app injects this fragment as HTML, so a contributed edit must not be able to carry a
// script, an event handler or a frame. Raw HTML in the Markdown is dropped, so the page can only
// contain what Markdown itself produces, and every link is checked as a parsed token against an
// allow-list. Checking the rendered HTML instead would miss a scheme hidden behind a character
// reference, such as "&#106;avascript:".
const markdown = new Marked({
  renderer: { html: () => '' },
  walkTokens(token) {
    if ((token.type === 'link' || token.type === 'image') && !SAFE_URL.test(token.href)) {
      throw new Error(`grammar: link "${token.href}" must start with https://, mailto: or #`);
    }
  },
});

/** Turns grammar/regole.md into the HTML fragment of the grammar page, without its title lines. */
export function renderGrammar(source: string): string {
  const body = source.replace(/^# .*\n+(Source: .*\n+)?/, '');
  return markdown.parse(body, { async: false });
}
