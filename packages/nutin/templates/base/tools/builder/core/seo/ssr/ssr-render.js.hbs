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
export async function renderRoute({ bundleUrl, appRoutesKey, mockParams, mockFetch, lang, pageUrl, i18nEnabled }) {
  // Passing a real URL instance as `location` gives `.pathname`/`.href`
  // which is what I18n's getLocaleFromUrl() actually reads.
  const { window } = parseHTML('<!doctype html><html><body></body></html>', { location: new URL(pageUrl) });
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
    const { appRoutes, I18nService, RouteGuardsManager, registerPipes } = bundle;

    const routeConfig = appRoutes[appRoutesKey];
    if (!routeConfig) {
      throw new Error(
        `No appRoutes entry found for "${appRoutesKey}" — check that config/seo.json's route "path" ` +
        `matches a real key in src/app/routes.ts.`
      );
    }

    registerPipes();

    if (i18nEnabled) await I18nService.setCurrentLanguage(lang);

    const viewConstructor = RouteGuardsManager.getViewConstructor(routeConfig);
    const view = viewConstructor();
    constructorName = view.constructor.name;

    if (mockParams) view.setRouteParams(mockParams);

    const element = view.render();

    await Promise.all(trackedFetches);
    await Promise.resolve();

    return element.outerHTML;
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
