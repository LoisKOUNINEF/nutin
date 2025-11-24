export interface IAttributesConfig {
  i18nKey?: string;
  textContent?: string;
  className?: string;
  style?: string;
// use regular pipe syntax for arguments / chaining
  pipes?: string;
}

export class AttributesHelper {
  public static setAttributes(element: HTMLElement, config: IAttributesConfig): void {
    this.setContent(element, config);
    this.setPipes(element, config);
    this.setStyle(element, config);
  }

  private static setContent(element: HTMLElement, config: IAttributesConfig): void {
    element.textContent = config.textContent || '';
    if (config.i18nKey) {
      element.setAttribute('data-i18n', config.i18nKey);
    }
  }

  private static setPipes(element: HTMLElement, config: IAttributesConfig): void {
    if (!config.pipes) return;
    element.setAttribute('data-pipe', config.pipes);
  }

  private static setStyle(element: HTMLElement, config: IAttributesConfig): void {    
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