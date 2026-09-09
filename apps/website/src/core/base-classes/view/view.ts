import { BaseComponent, BaseComponentOptions } from '../../index.js';

export interface ViewOptions extends BaseComponentOptions {
  viewName: string;
}

export abstract class View<T extends HTMLElement = HTMLElement> extends BaseComponent<T> {
  private _viewName: string;
  protected routeParams: Record<string, string> = {};
  private _template: string;

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

  // Navigation hooks — called by router only, never by render lifecycle
  public onEnter(): void {}
  public onExit(): void {}
}
