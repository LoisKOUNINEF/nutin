import { buildRobotsTxt } from './generate-robots-txt.js';

const groupOf = (txt, bot) => {
  const lines = txt.split('\n');
  const start = lines.indexOf(`User-agent: ${bot}`);
  const end = lines.indexOf('', start);
  return lines.slice(start + 1, end === -1 ? undefined : end);
};

describe('buildRobotsTxt', () => {
  it('a bot in disallowBots is fully blocked even when a route also names it', () => {
    const txt = buildRobotsTxt({
      baseUrl: 'https://site.test/',
      disallowBots: ['GPTBot'],
      routes: [{ path: '/private', disallow: ['GPTBot'] }],
    });

    expect(groupOf(txt, 'GPTBot')).toEqual(['Disallow: /']);
  });

  it('a bot with its own group repeats the global disallows', () => {
    const txt = buildRobotsTxt({
      baseUrl: 'https://site.test',
      routes: [
        { path: '/admin', disallow: true },
        { path: '/drafts', disallow: ['Bingbot'] },
      ],
    });

    expect(groupOf(txt, '*')).toEqual(['Allow: /', 'Disallow: /admin']);
    expect(groupOf(txt, 'Bingbot')).toEqual(['Disallow: /admin', 'Disallow: /drafts']);
  });

  it('turns :param segments into wildcards and prefixes every language with i18n on', () => {
    const txt = buildRobotsTxt(
      { baseUrl: 'https://site.test', routes: [{ path: '/users/:id', disallow: true }] },
      { i18n: true, languages: ['en', 'fr'] }
    );

    expect(groupOf(txt, '*')).toEqual(['Allow: /', 'Disallow: /en/users/*', 'Disallow: /fr/users/*']);
  });

  it('ends with the sitemap URL', () => {
    const txt = buildRobotsTxt({ baseUrl: 'https://site.test/', routes: [] });

    expect(txt.endsWith('Sitemap: https://site.test/sitemap.xml\n')).toBeTruthy();
  });
});
