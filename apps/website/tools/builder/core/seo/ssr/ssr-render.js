import { parseHTML } from 'linkedom';
import path from 'path';
import { PATHS } from '../../app/paths.js';
import { installGlobals } from './ssr-polyfills.js';
import { print } from '../../../../utils/index.js';

let renderIndex = 0;

/**
 * Reads the real app's route paths (the keys of `appRoutes`) without rendering anything —
 * used to warn about app routes that have no matching config/seo.json entry.
 */
export async function getAppRoutePaths(bundleUrl, lang, pageUrl) {
  // Same reasoning as renderRoute() below: I18n's getLocaleFromUrl() reads
  // window.location.pathname, so a location-less window crashes as soon as the
  // bundle's module-load side effects instantiate I18n.getInstance().
  const { window } = parseHTML('<!doctype html><html><body></body></html>', { location: new URL(pageUrl) });
  installGlobals(window, { lang });
  const bundle = await import(`${bundleUrl}?ssr=routes-check`);
  return Object.keys(bundle.appRoutes);
}

/**
 * Renders one (route, lang) pair by instantiating the real View via appRoutes and calling
 * .render(), returning the resulting real markup. Fresh linkedom window + cache-busted
 * dynamic import per call, so no singleton state (I18nService, etc.) leaks between renders.
 */
export async function renderRoute({ bundleUrl, appRoutesKey, mockParams, mockFetch, preloadManifest, lang, pageUrl, i18nEnabled }) {
  // Passing a real URL instance as `location` gives `.pathname`/`.href`
  // which is what I18n's getLocaleFromUrl() actually reads.
  // <main id="app"> mirrors index.html's real mount target — View defaults to mounting
  // there (view.ts), and without it the View tree is never attached to `document`, so
  // DomHelper.cleanupOptionalContent()'s document-wide `[data-optional]` query silently
  // misses it, leaking raw "undefined" text for any unset optional field (e.g. snippets).
  const { window } = parseHTML('<!doctype html><html><body><main id="app"></main></body></html>', { location: new URL(pageUrl) });
  const { trackedFetches } = installGlobals(window, {
    lang,
    mockFetch: mockFetch ?? {},
    localesDir: path.join(PATHS.tempSource, 'locales'),
  });

  let Service;
  let constructorName = appRoutesKey;

  try {
    const bundle = await import(`${bundleUrl}?ssr=${renderIndex++}`);
    ({ Service } = bundle);
    const {
      appRoutes, I18nService, RouteGuardsManager, registerPipes,
      NavbarComponent, FooterComponent,
      DocsManifestService, ChangelogManifestService, TutorialManifestService, ArticlesManifestService,
    } = bundle;

    const routeConfig = appRoutes[appRoutesKey];
    if (!routeConfig) {
      throw new Error(
        `No appRoutes entry found for "${appRoutesKey}" — check that config/seo.json's route "path" ` +
        `matches a real key in src/app/routes.ts.`
      );
    }

    registerPipes();

    if (i18nEnabled) await I18nService.setCurrentLanguage(lang);

    // Manifest-driven views (docs/changelog/tutorial/articles) read their manifest service's
    // already-loaded data synchronously in registerChildren() — main.ts normally loads it at
    // bootstrap, which never runs here, so it must be preloaded before .render() or the view
    // finds no page and renders its empty state instead of real content.
    if (preloadManifest) {
      const manifestServices = {
        docs: DocsManifestService,
        changelog: ChangelogManifestService,
        tutorial: TutorialManifestService,
        articles: ArticlesManifestService,
      };
      await manifestServices[preloadManifest]?.load();
    }

    const viewConstructor = RouteGuardsManager.getViewConstructor(routeConfig);
    const view = viewConstructor();
    constructorName = view.constructor.name;

    if (mockParams) view.setRouteParams(mockParams);

    const element = view.render();

    // Static/i18n-only globals — no route-specific data or active-link-by-route logic —
    // so rendering them per (route, lang) call is safe and needs no cross-call caching.
    // ids are set to match Globals.register's mount() — the client relies on these ids to
    // find and remove this static markup before mounting its own live copy on boot.
    const navbarElement = new NavbarComponent('body').render();
    navbarElement.id = 'navbar';
    const footerElement = new FooterComponent('body').render();
    footerElement.id = 'footer';
    const navbar = navbarElement.outerHTML;
    const footer = footerElement.outerHTML;

    await Promise.all(trackedFetches);
    await Promise.resolve();

    return { body: element.outerHTML, navbar, footer };
  } catch (err) {
    throw new Error(
      `[ssr] Failed to render route "${appRoutesKey}" (lang "${lang}", view "${constructorName}"): ${err.message}${hintForError(err)}`,
      { cause: err }
    );
  } finally {
    if (Service) {
      try {
        await Service.destroyAll();
      } catch (cleanupErr) {
        print.grayError(`[ssr] destroyAll cleanup failed: ${cleanupErr.message}`);
      }
    }
  }
}

function hintForError(err) {
  if (err instanceof ReferenceError && /is not defined$/.test(err.message)) {
    return (
      `\n  Hint: this usually means the component tree touches an unguarded browser global ` +
      `(e.g. "window", "navigator", "matchMedia") that isn't polyfilled for SSR — see ` +
      `tools/builder/core/ssr/ssr-polyfills.js.`
    );
  }
  return '';
}
