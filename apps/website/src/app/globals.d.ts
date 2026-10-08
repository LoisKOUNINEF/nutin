declare interface AppEventMap { }

// Prism
declare interface Window {
  Prism: {
    highlightAll(): void;
    highlightAllUnder(container: HTMLElement | DocumentFragment): void;
  };
}
