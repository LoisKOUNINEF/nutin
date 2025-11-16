describe('App container', () => {
  it('should exist', () => {
    const appContainer = document.getElementById('app');
    expect(appContainer).toBeDefined();
  });
  it('should have title', () => {
    expect(document.title).toEqual("nutin-website");
  });
  it('should have meta description', () => {
    const desc = document.querySelector('meta[name="description"]').content;
    expect(desc).toEqual('nutin-website');
  });
});
