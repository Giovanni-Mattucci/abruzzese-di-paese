import { Marked } from 'marked';

// Raw HTML in the Markdown is dropped, so the page can only ever contain what Markdown itself
// produces. The web app injects this fragment as HTML, so a contributed edit must not be able to
// carry a script, an event handler or a frame.
const markdown = new Marked({ renderer: { html: () => '' } });

/** Turns grammar/regole.md into the HTML fragment of the grammar page, without its title lines. */
export function renderGrammar(source: string): string {
  const body = source.replace(/^# .*\n+(Source: .*\n+)?/, '');
  const html = markdown.parse(body, { async: false });
  // Markdown links are the one other way in: [text](javascript:...) would still be a link.
  if (/href="\s*(javascript|data|vbscript):/i.test(html)) {
    throw new Error('grammar: links must not use javascript:, data: or vbscript: URLs');
  }
  return html;
}
