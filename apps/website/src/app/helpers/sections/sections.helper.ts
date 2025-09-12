const lang = navigator.language.split('-')[0] as unknown as keyof Omit<LocalizedSection, 'id'>;
const defaultLang = 'en' as unknown as keyof Omit<LocalizedSection, 'id'>;

export function translateSection(localizedSection: LocalizedSection): ISection {
  const section = localizedSection[lang] ?? localizedSection[defaultLang];
  return {
    ...section,
    id: localizedSection.id
  };
}

export function mergeSectionWithSnippets(
  section: ISection, 
  snippets: ISnippet[]
): ISection {
  return {
    ...section,
    snippets: [
      ...(section.snippets || []),
      ...snippets.filter(snippet => snippet.sectionId === section.id)
    ]
  };
}

export function sectionManager(section: LocalizedSection, snippets: ISnippet[]) {
  return mergeSectionWithSnippets(translateSection(section), snippets);
}
