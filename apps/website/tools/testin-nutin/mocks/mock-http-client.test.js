import { MockHttpClient } from './mock-http-client.js';

describe('MockHttpClient', () => {
  it('exposes get/post/put/patch/delete as independent bare mocks', () => {
    const client = new MockHttpClient();
    client.get.mockReturnValue('get-result');
    client.post('/widgets', { name: 'a' });

    expect(client.get()).toBe('get-result');
    expect(client.post.calls).toEqual([['/widgets', { name: 'a' }]]);
    expect(client.put.calls).toEqual([]);
  });

  it('exposes the interceptor registration methods as mocks', () => {
    const client = new MockHttpClient();
    const interceptor = () => {};
    client.addRequestInterceptor(interceptor);
    client.addResponseInterceptor(interceptor);

    expect(client.addRequestInterceptor).toHaveBeenCalledWith(interceptor);
    expect(client.addResponseInterceptor).toHaveBeenCalledWith(interceptor);
  });

  it('reset() clears calls and configured return values on every method', () => {
    const client = new MockHttpClient();
    client.get.mockReturnValue('cached');
    client.get();
    client.delete('/widgets/1');
    client.addRequestInterceptor(() => {});

    client.reset();

    expect(client.get.calls).toEqual([]);
    expect(client.delete.calls).toEqual([]);
    expect(client.addRequestInterceptor.calls).toEqual([]);
    expect(client.get()).toBe(undefined);
  });
});
