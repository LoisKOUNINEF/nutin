import { Service } from '../../base-classes/index.js';

export interface GlobalMountable {
  render(): HTMLElement;
  destroy?(): void;
}

export interface GlobalConfig<T extends GlobalMountable = GlobalMountable> {
  /** The component's own class — constructed internally as `new component(mountTarget)`. */
  component: new (mountTarget: HTMLElement) => T;
  /** Stamped onto the mounted root element; pass this same id to `hideGlobals`/`revealGlobals`. */
  id: string;
}

export interface RegisterGlobalsOptions {
  /** Rendered and prepended to `<body>`, in the given order (e.g. a header). */
  before?: GlobalConfig[];
  /** Rendered and appended to `<body>`, in the given order (e.g. a footer). */
  after?: GlobalConfig[];
}

export class Globals extends Service<Globals> {
  private _mounted: Record<string, GlobalMountable> = {};
  private _originalDisplay: Record<string, string> = {};

  constructor() { super(); }

  public register({ before = [], after = [] }: RegisterGlobalsOptions): void {
    // Component subclasses generated via `nutin generate component` type their
    // mountTarget param as HTMLElement, but DomHelper.mountElement only
    // *appends* (rather than replacing) the target when mountTarget is a string
    // selector. This cast satisfies the stricter constructor type while still
    // passing the string 'body' through at runtime, so components append into
    // <body> instead of replacing it.
    const mountTarget = 'body' as unknown as HTMLElement;
    const isElement = (el: HTMLElement | null): el is HTMLElement => el !== null;

    const mount = ({ component: Component, id }: GlobalConfig): HTMLElement | null => {
      if (this._mounted[id]) {
        console.warn(`Global "${id}" is already registered - skipping.`);
        return null;
      }
      const instance = new Component(mountTarget);
      const element = instance.render();
      element.id = id;
      this._mounted[id] = instance;
      return element;
    };

    document.body.prepend(...before.map(mount).filter(isElement));
    document.body.append(...after.map(mount).filter(isElement));
  }

  public hide(globalIds: string[]): void {
    globalIds.forEach((id) => {
      const el = document.getElementById(id) as HTMLElement | null;
      if (!el) return;
      if (!(id in this._originalDisplay)) {
        this._originalDisplay[id] = el.style.display || getComputedStyle(el).display;
      }
      el.style.display = 'none';
    });
  }

  public reveal(globalIds: string[], display?: string): void {
    globalIds.forEach((id) => {
      const el = document.getElementById(id) as HTMLElement | null;
      if (!el) return;
      el.style.display = display ?? this._originalDisplay[id] ?? 'block';
    });
  }

  protected onDestroy(): void {
    Object.values(this._mounted).forEach((instance) => instance.destroy?.());
    this._mounted = {};
    this._originalDisplay = {};
  }
}

/**
 * Mounts components outside the router's render target (`<main id="app">`),
 * e.g. a header/footer that should persist across every route. Each entry's
 * `component` is constructed internally — callers never see or handle
 * `mountTarget` themselves — and its rendered root element is given the
 * entry's `id`, so `hideGlobals(ids)`/`revealGlobals(ids)` can target it
 * later by that same id. Registering an `id` that's already registered logs
 * a `console.warn` and skips it.
 */
export const registerGlobals = (options: RegisterGlobalsOptions): void => {
  Globals.getInstance().register(options);
};

/** Hide the elements with the given ids (as registered via `registerGlobals`). */
export const hideGlobals = (globalIds: string[]): void => {
  Globals.getInstance().hide(globalIds);
};

/**
 * Reveal the elements with the given ids (as registered via `registerGlobals`), restoring
 * each element's display value as captured by `hideGlobals` — pass `display` to override.
 */
export const revealGlobals = (globalIds: string[], display?: string): void => {
  Globals.getInstance().reveal(globalIds, display);
};
