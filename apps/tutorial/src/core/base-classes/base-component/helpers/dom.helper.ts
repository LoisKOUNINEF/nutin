export class DomHelper {
  public static mountElement(element: HTMLElement, mountTarget: string | HTMLElement): void {
    const target = typeof mountTarget === 'string' 
      ? document.querySelector(mountTarget) 
      : mountTarget;

    if (target instanceof HTMLElement) {
      if (typeof mountTarget === 'string') {
        // Append mode
        target.appendChild(element);
      } else {
        // Replace placeholder mode
        target.replaceWith(element);
      }
    } else {
      console.warn('Invalid mount target for component:', mountTarget);
    }
  }

  public static createElement<T extends HTMLElement>(
    tagName: keyof HTMLElementTagNameMap, 
    template: string = ''
  ): T {
    const element = document.createElement(tagName) as T;
    element.innerHTML = template;
    return element;
  }
}
