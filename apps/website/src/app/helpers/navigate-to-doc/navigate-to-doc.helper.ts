import { Navigation } from '../../../core/index.js';

export function navigateToDoc(slug: string): void {
  Navigation.navigateTo(`/docs/${slug}`);
  window.scrollTo({ top: 0 });
}
