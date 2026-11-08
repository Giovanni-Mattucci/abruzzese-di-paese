import type { DictionaryEntry } from '@adp/data';
import { describe, expect, it } from 'vitest';
import {
  browseHead,
  entryHead,
  headTags,
  homeHead,
  JSON_LT_ESCAPE,
  jsonForScript,
  notFoundHead,
  staticHead,
} from './head';

const site = 'https://example.test/abruzzese-di-paese';
const entry: DictionaryEntry = {
  id: 'a-ardeca',
  headword: 'ardeca',
  senses: [{ it: 'ortica', en: 'nettle', enTranslateStatus: 'machine' }],
  source: { letter: 'a', url: 'https://www.abruzzo.fm/archivio/treppecore/a.html' },
};
const hostile = 'a<b>"c"</script><script>alert(1)</script>';

function ldJson(tags: string): string {
  const match = /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(tags);
  if (!match?.[1]) throw new Error('no JSON-LD block');
  return match[1];
}

describe('jsonForScript', () => {
  it('leaves no "<" in the output and round-trips through JSON.parse', () => {
    const out = jsonForScript({ name: hostile });
    expect(JSON_LT_ESCAPE).toHaveLength(6);
    expect(out).not.toContain('<');
    expect(out).toContain(`${JSON_LT_ESCAPE}/script>`);
    expect(JSON.parse(out)).toEqual({ name: hostile });
  });
});

describe('entryHead', () => {
  it('builds a title, description and DefinedTerm JSON-LD', () => {
    const head = entryHead(entry, site);
    expect(head.title).toBe('ardeca · Abruzzese di paese');
    expect(head.description).toBe('ardeca: ortica. English: nettle.');
    expect(head.noindex).toBeUndefined();
    expect(head.jsonLd).toMatchObject({
      '@type': 'DefinedTerm',
      name: 'ardeca',
      termCode: 'a-ardeca',
      description: 'ortica',
      alternateName: 'nettle',
      inDefinedTermSet: `${site}/#termset`,
    });
  });

  it('truncates long descriptions to 160 characters', () => {
    const long = { ...entry, senses: [{ it: 'x'.repeat(300) }] };
    expect(entryHead(long, site).description.length).toBeLessThanOrEqual(160);
  });

  it('describes stubs without senses honestly and marks them noindex', () => {
    const stub = { ...entry, headword: 'verso e, quindi,', senses: [] };
    const head = entryHead(stub, site);
    expect(head.description).toBe(
      '"verso e, quindi," in the Abruzzese dialect dictionary. This entry is awaiting review.',
    );
    expect(head.noindex).toBe(true);
    expect(head.jsonLd).not.toHaveProperty('description');
    const tags = headTags(head, site, '/');
    expect(tags).toContain('<meta name="robots" content="noindex">');
    expect(tags).not.toContain('rel="canonical"');
  });
});

describe('homeHead, browseHead, staticHead, notFoundHead', () => {
  it('describe the site, the letter, the static pages and the 404 page', () => {
    expect(homeHead(3737, site).description).toContain('3737 words');
    expect(homeHead(3737, site).jsonLd).toMatchObject({
      '@graph': [{ '@type': 'WebSite' }, { '@type': 'DefinedTermSet' }],
    });
    expect(browseHead('s', 657).title).toBe('Words starting with S · Abruzzese di paese');
    expect(staticHead('/grammar').path).toBe('/grammar');
    expect(notFoundHead()).toMatchObject({
      title: 'Page not found · Abruzzese di paese',
      noindex: true,
    });
  });
});

describe('headTags', () => {
  it('escapes HTML attributes and text', () => {
    const tags = headTags(
      entryHead({ ...entry, headword: 'a<b>"c"' }, site),
      site,
      '/abruzzese-di-paese/',
    );
    expect(tags).toContain('<title>a&lt;b&gt;&quot;c&quot; · Abruzzese di paese</title>');
    expect(tags).toContain(
      '<link rel="canonical" href="https://example.test/abruzzese-di-paese/word/a-ardeca">',
    );
    expect(tags).toContain(
      '<link rel="alternate" type="application/json" href="/abruzzese-di-paese/data/dictionary.json">',
    );
    expect(tags).toContain('<meta property="og:type" content="article">');
  });

  it('never lets dictionary text close the JSON-LD script element', () => {
    const tags = headTags(entryHead({ ...entry, headword: hostile }, site), site, '/');
    expect(tags.match(/<\/script>/g)).toHaveLength(1);
    expect(tags).not.toContain('<script>alert');
    expect(JSON.parse(ldJson(tags))).toMatchObject({ name: hostile });
  });
});
