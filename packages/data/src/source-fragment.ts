/**
 * A text fragment (`#:~:text=`) that makes the browser scroll to and highlight an entry's line
 * on its source page. `start` is the text to find; `prefix`, when set, is the text just before
 * it, used when `start` alone would first match an earlier line.
 */
export interface SourceFragment {
  start: string;
  prefix?: string;
}

// Text fragment syntax reserves "-", "," and "&", so those must be percent-encoded as well.
const encode = (text: string): string => encodeURIComponent(text).replace(/-/g, '%2D');

/** The source URL with a text fragment appended, or unchanged when there is none. */
export function withTextFragment(url: string, fragment?: SourceFragment): string {
  if (!fragment) return url;
  const prefix = fragment.prefix ? `${encode(fragment.prefix)}-,` : '';
  return `${url}#:~:text=${prefix}${encode(fragment.start)}`;
}
