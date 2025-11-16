export interface IAttributesConfig {
  textContent?: string;
  className?: string;
  style?: string;
// use regular pipe syntax for arguments / chaining
  pipes?: string;
}

export class AttributesHelper {
  static setContent(element: HTMLElement, config: IAttributesConfig) {
    element.textContent = config.textContent || '';
  }

  static setPipes(element: HTMLElement, config: IAttributesConfig) {
    if (!config.pipes) return;
    element.setAttribute('data-pipe', config.pipes);
  }

  static setStyle(element: HTMLElement, config: IAttributesConfig) {    
    const classes = [
      config.className
    ].filter(Boolean).join(' ');

    const style = [
      config.style
    ].filter(Boolean).join(' ');
    
    if (classes) {
      element.className = classes;
    }

    if(style) {
      element.style = style;
    }
  }
}