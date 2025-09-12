export const PrismHighlighter = {
  /**
   * Highlights all code blocks within elements marked for Prism highlighting.
   * @param root Optional root container to scope the search.
   */
  apply(root: HTMLElement | Document = document): void {
    if (typeof window.Prism === 'undefined') {
      console.warn('PrismJS is not loaded. Make sure prism.js is included.');
      return;
    }

    const targets = root.querySelectorAll<HTMLElement>('[data-highlight="prism"]');
    
    targets.forEach(target => {
      window.Prism.highlightAllUnder(target);
    });
  }
};

