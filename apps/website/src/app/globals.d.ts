declare namespace Nutin {
  interface AppEventMap {}
}

// Prism
declare interface Window {
  Prism: {
    highlightAll(): void;
    highlightAllUnder(container: HTMLElement | DocumentFragment): void;
  };
}
