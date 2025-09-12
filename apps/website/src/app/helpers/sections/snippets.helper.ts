import { sortById } from "../index.js";

const lang = navigator.language.split('-')[0];
const defaultLang = 'en';

export function translateSnippets(localizedSnippets: Array<LocalizedSnippet>): ISnippet[] {
  return localizedSnippets.map((snippet) => {
    const localizedSnippet = snippet[lang] ?? snippet[defaultLang];
    return {
      ...localizedSnippet,
      id: snippet.id,
      sectionId: snippet.sectionId,
      content: snippet.content,
      type: snippet.type
    };
  })
}

export function snippetsManager(snippets: LocalizedSnippet[]): ISnippet[] {
  return sortById(translateSnippets(snippets));
}