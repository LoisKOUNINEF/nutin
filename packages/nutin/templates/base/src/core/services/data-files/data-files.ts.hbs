/**
 * The URL to fetch a runtime JSON file from (`/locales/<lang>.json`, `/generated/<id>.json`).
 * Prod builds map it to its content-hashed copy.
 * Any other URL, and every URL in dev and tests, is returned unchanged.
 */
export function dataFileUrl(url: string): string {
  const dataFiles: Record<string, string> = JSON.parse(globalThis.__NUTIN_DATA_FILES__ ?? '{}');
  // Own keys only: "constructor" must not resolve to Object.prototype's.
  return (Object.prototype.hasOwnProperty.call(dataFiles, url) && dataFiles[url]) || url;
}

/**
 * Fetches a runtime JSON file from its content-hashed copy (dataFileUrl).
 * If that copy is gone, from its plain URL: the tab gets the current data instead of an error.
 * Any status but 2xx falls back; a network error doesn't. Without a map, it's a single fetch.
 */
export async function fetchDataFile(url: string): Promise<Response> {
  const hashed = dataFileUrl(url);
  const response = await fetch(hashed);
  return response.ok || hashed === url ? response : fetch(url);
}
