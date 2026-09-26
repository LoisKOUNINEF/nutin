import { Navigation } from '../../../core/index.js';

// `href` is the anchor's real href (e.g. "/docs/api/slug" or "/docs/api/slug#heading-id") —
// Router.navigate() owns hash-aware scrolling, so this just forwards it untouched.
export function navigateToDoc(href: string): void {
  Navigation.navigateTo(href);
}
