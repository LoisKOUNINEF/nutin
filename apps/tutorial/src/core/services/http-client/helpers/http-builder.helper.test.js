import { HttpBuilder } from '#root/dist/src/core/services/http-client/helpers/http-builder.helper.js';

const mockAbortSignal = {
    aborted: false,
    onabort: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  };

describe('HttpBuilder', () => {
  // Tests for buildRequestBody
  it('buildRequestBody returns undefined for null input', () => {
    const result = HttpBuilder.buildRequestBody(null);
    expect(result).toBeUndefined();
  });

  it('buildRequestBody returns undefined for undefined input', () => {
    const result = HttpBuilder.buildRequestBody(undefined);
    expect(result).toBeUndefined();
  });

  it('buildRequestBody returns string for object input', () => {
    const data = { name: 'Alice' };
    const result = HttpBuilder.buildRequestBody(data);
    expect(result).toBe(JSON.stringify(data));
  });

  it('buildRequestBody handles primitive types', () => {
    expect(HttpBuilder.buildRequestBody(42)).toBe('42');
    expect(HttpBuilder.buildRequestBody('text')).toContain('text');
    expect(HttpBuilder.buildRequestBody(true)).toBeDefined();
  });

  // Tests for appendQueryParams
  it('appendQueryParams adds params to URL without existing query', () => {
    const url = new URL('https://api.example.com');
    HttpBuilder.appendQueryParams(url, { page: '1', limit: '10' });
    expect(url.search).toBe('?page=1&limit=10');
  });

  it('appendQueryParams appends to existing query params', () => {
    const url = new URL('https://api.example.com?page=1');
    HttpBuilder.appendQueryParams(url, { limit: '10' });
    expect(url.search).toBe('?page=1&limit=10');
  });

  it('appendQueryParams handles special characters', () => {
    const url = new URL('https://api.example.com');
    HttpBuilder.appendQueryParams(url, { key: 'value with spaces', q: 'search&filter' });
    expect(url.searchParams.get('key')).toBe('value with spaces');
    expect(url.searchParams.get('q')).toBe('search&filter');
  });

  it('appendQueryParams does nothing for empty params', () => {
    const originalUrl = 'https://api.example.com/';
    const url = new URL(originalUrl);
    HttpBuilder.appendQueryParams(url, {});
    expect(url.toString()).toBe(originalUrl);
  });

  // Tests for buildRequestUrl
  it('buildRequestUrl returns URL without query params', () => {
    const url = HttpBuilder.buildRequestUrl('https://api.example.com');
    expect(url.search).toBe('');
  });

  it('buildRequestUrl correctly adds query params', () => {
    const url = HttpBuilder.buildRequestUrl('https://api.example.com', { page: '1' });
    expect(url.search).toBe('?page=1');
  });

  it('buildRequestUrl handles existing query in endpoint', () => {
    const url = HttpBuilder.buildRequestUrl('https://api.example.com?page=1', { limit: '10' });
    expect(url.search).toBe('?page=1&limit=10');
  });

  // Tests for buildRequestOptions
  it('buildRequestOptions sets GET without body', () => {
    const options = HttpBuilder.buildRequestOptions(
      'GET',
      null,
      { headers: { 'X-Test': 'value' } },
      mockAbortSignal
    );
    expect(options.method).toBe('GET');
    expect(options.body).toBeUndefined();
    expect(JSON.stringify(options.headers)).toBe(JSON.stringify({ 'X-Test': 'value' }));
    expect(options.signal).toBe(mockAbortSignal);
  });

  it('buildRequestOptions sets POST with body', () => {
    const data = { name: 'Alice' };
    const options = HttpBuilder.buildRequestOptions(
      'POST',
      data,
      { headers: { 'Content-Type': 'application/json' } },
      mockAbortSignal
    );
    expect(options.method).toBe('POST');
    expect(options.body).toBe(JSON.stringify(data));
  });

  it('buildRequestOptions handles empty config', () => {
    const options = HttpBuilder.buildRequestOptions('GET', null, {}, mockAbortSignal);
    expect(options.body).toBeUndefined();
    expect(options.headers).toBeUndefined();
  });
})
