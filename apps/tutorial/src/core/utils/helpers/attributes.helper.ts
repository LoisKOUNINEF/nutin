export interface IAttributesConfig {
  i18nKey?: string;
  textContent?: string;
  className?: string;
  style?: string;
  pipes?: string;
}

export class AttributesHelper {
  static setContent(element: HTMLElement, config: IAttributesConfig) {
    element.textContent = config.textContent || '';
    if (config.i18nKey) {
      element.setAttribute('data-i18n', config.i18nKey);
    }
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