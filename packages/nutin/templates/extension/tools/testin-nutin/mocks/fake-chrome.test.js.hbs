import { createFakeChrome, installFakeChrome, uninstallFakeChrome } from './fake-chrome.js';

describe('fake chrome', () => {
  afterEach(() => uninstallFakeChrome());

  it('installFakeChrome() sets the global chrome, uninstallFakeChrome() removes it', () => {
    const fake = installFakeChrome();
    expect(globalThis.chrome).toBe(fake);
    uninstallFakeChrome();
    expect(globalThis.chrome).toBeUndefined();
  });

  it('storage clones values in and out, and reports changes with the area\'s name', async () => {
    const fake = createFakeChrome();
    const seen = [];
    fake.storage.onChanged.addListener((changes, area) => seen.push([changes, area]));
    const value = { list: [1] };

    await fake.storage.sync.set({ a: value });
    value.list.push(2);
    const read = await fake.storage.sync.get(['a']);
    read.a.list.push(3);

    expect(await fake.storage.sync.get(null)).toEqual({ a: { list: [1] } });
    expect(seen).toEqual([[{ a: { oldValue: undefined, newValue: { list: [1] } } }, 'sync']]);
  });

  it('storage remove() reports only the keys it removed', async () => {
    const fake = createFakeChrome();
    await fake.storage.local.set({ a: 1 });
    const seen = [];
    fake.storage.onChanged.addListener((changes) => seen.push(changes));

    await fake.storage.local.remove(['a', 'missing']);

    expect(seen).toEqual([{ a: { oldValue: 1 } }]);
    expect(await fake.storage.local.get(null)).toEqual({});
  });

  it('failNextSet rejects the next set() only', async () => {
    const fake = createFakeChrome();
    fake.storage.sync.failNextSet = new Error('QUOTA_BYTES quota exceeded');

    await expect(() => fake.storage.sync.set({ a: 1 })).toThrow('QUOTA_BYTES quota exceeded');
    await fake.storage.sync.set({ a: 2 });
    expect(await fake.storage.sync.get(['a'])).toEqual({ a: 2 });
  });

  it('tabs follow activateTab() and navigate(), and record create()/update()', async () => {
    const fake = createFakeChrome({ url: 'https://example.com/a' });
    const events = [];
    fake.tabs.onActivated.addListener(() => events.push('activated'));
    fake.tabs.onUpdated.addListener((_id, change) => events.push(change.url));

    fake.activateTab('https://example.com/b');
    expect((await fake.tabs.query({}))[0].url).toBe('https://example.com/b');
    await fake.tabs.update(1, { url: 'https://example.com/c' });
    await fake.tabs.create({ url: 'https://example.com/d' });

    expect(events).toEqual(['activated', 'https://example.com/c']);
    expect(fake.tabs.updated).toEqual([{ tabId: 1, url: 'https://example.com/c' }]);
    expect(fake.tabs.created).toEqual([{ url: 'https://example.com/d' }]);
  });

  it('runtime.getURL() gives chrome-extension:// URLs, or moz-extension:// ones for firefox', () => {
    expect(createFakeChrome().runtime.getURL('index.html')).toBe('chrome-extension://test/index.html');
    expect(createFakeChrome({ browser: 'firefox' }).runtime.getURL('')).toBe('moz-extension://test/');
  });
});
