import { Service } from '../../base-classes/service/service.js';

export class Globals extends Service<Globals> {
  private _mounted: Record<string, Nutin.GlobalMountable> = {};
  private _originalDisplay: Record<string, string> = {};

  constructor() { super(); }

  public register({ before = [], after = [] }: Nutin.RegisterGlobalsOptions): void {
    // Satisfies the stricter constructor type while letting components append into <body> instead of replacing it.
    const mountTarget = 'body' as unknown as HTMLElement;
    const isElement = (el: HTMLElement | null): el is HTMLElement => el !== null;

    const mount = ({ component: Component, id }: Nutin.GlobalConfig): HTMLElement | null => {
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
 * `component` is constructed internally and its rendered root element is given the
 * entry's `id`, so `hideGlobals(ids)`/`revealGlobals(ids)` can target it
 * later by that same id. Registering an `id` that's already registered logs
 * a `console.warn` and skips it.
 */
export const registerGlobals = (options: Nutin.RegisterGlobalsOptions): void => {
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
