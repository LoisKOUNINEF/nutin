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
    viewName,
    trustLevel,
  }: ViewOptions) {
    super({ mountTarget, tagName, trustLevel });
    this._template = template ?? '';
    this.viewName = viewName || this.getKebabCaseViewName();
  }

  private _template: string;

  protected override generateTemplate(): string {
    return this._template;
  }

  public setRouteParams(params: Record<string, string>): void {
    this.routeParams = { ...params };
  }

  public getRouteParams(): Record<string, string> {
    return { ...this.routeParams };
  }

  public getRouteParam(key: string): string | undefined {
    return this.routeParams[key];
  }

  public hasRouteParam(key: string): boolean {
    return key in this.routeParams && this.routeParams[key] !== undefined;
  }

  public shouldUpdateMetaContent(): boolean {
    return true;
  }

  private getKebabCaseViewName(): string {
    const className = this.constructor.name;
    const baseName = className.replace(/View$/, '');
    return baseName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  // Navigation hooks — called by router only, never by render lifecycle
  public onEnter(): void {}
  public onExit(): void {}
}
