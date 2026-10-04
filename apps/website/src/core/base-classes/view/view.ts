import { BaseComponent } from '../../index.js';

export abstract class View<T extends HTMLElement = HTMLElement> extends BaseComponent<T> {
  private _viewName: string;
  protected routeParams: Record<string, string> = {};
  private _template: Template;

  constructor({
    template,
    tagName = 'section',
    mountTarget = '#app',
    viewName,
    trustLevel,
  }: ViewOptions) {
    super({ mountTarget, tagName, trustLevel });
    if (!viewName) throw new Error('View requires a viewName.');
    this._template = template ?? '';
    this._viewName = viewName;
  }

  public get viewName(): string {
    return this._viewName;
  }

  protected override generateTemplate(): Template {
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

  // The page's title, read by the router after each navigation (document.title). Override it
  // for a title that depends on the route, e.g. the page being shown. Undefined: the router
  // uses config/seo.json's title, then the "<viewName>.title" translation, then viewName.
  public documentTitle(): string | undefined {
    return undefined;
  }

  // Navigation hooks — called by router only, never by render lifecycle
  public onEnter(): void {}
  public onExit(): void {}
}
