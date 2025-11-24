import { BaseComponent, BaseComponentOptions } from '../../index.js';

export interface ViewOptions extends BaseComponentOptions {
  viewName?: string;
}

export abstract class View<T extends HTMLElement = HTMLElement> extends BaseComponent<T> {
  public viewName: string;
  protected routeParams: Record<string, string> = {};

  constructor({
      template,
      tagName = 'section',
      mountTarget = '#app',
      viewName
    }: ViewOptions) {
    super({template, mountTarget, tagName});
    this.viewName = viewName || this.getKebabCaseViewName();
  }

   /**
   * Set route parameters for this view instance
   * Called by the router when the view is instantiated
   */
  public setRouteParams(params: Record<string, string>): void {
    this.routeParams = { ...params };
  }

  /**
   * Get all route parameters
   */
  public getRouteParams(): Record<string, string> {
    return { ...this.routeParams };
  }

  /**
   * Get a specific route parameter
   */
  public getRouteParam(key: string): string | undefined {
    return this.routeParams[key];
  }

  /**
   * Check if a route parameter exists and has a value
   */
  public hasRouteParam(key: string): boolean {
    return key in this.routeParams && this.routeParams[key] !== undefined;
  }

  public shouldUpdateMetaContent(): boolean {
    return true;
  }
  
  public onEnter(): void {
    console.log(`${this.viewName} mounted with params:`, this.routeParams);
  }

  public onExit(): void {
    console.log(`${this.viewName} unmounted`);
  }

  public override render(): HTMLElement {
    this.onEnter();
    return super.render();
  }

  public override destroy(): void {
    super.destroy();
    this.onExit();
  }

  private getKebabCaseViewName(): string {
    const className = this.constructor.name;
    const baseName = className.replace(/View$/, '');
    return baseName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }
}
