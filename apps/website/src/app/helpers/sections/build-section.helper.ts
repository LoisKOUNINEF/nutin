import { I18nService } from "../../../core/index.js";
import { sortById } from "../sort/sort-by-id.helper.js";

type ILocalizedSectionWithSnippets = {
  section: LocalizedSection,
  snippets: LocalizedSnippet[]
}

export class BuildSectionHelper {
  private static lang = I18nService.currentLanguage;
  private static defaultLang = I18nService.defaultLanguage;

  private static translateLocalized<T>(localizedData: any, extraFields: string[] = []): T {
    const translated = localizedData[this.lang] ?? localizedData[this.defaultLang];
    
    const result: any = {
      ...translated,
      id: localizedData.id
    };

    extraFields.forEach(field => {
      if (localizedData[field] !== undefined) {
        result[field] = localizedData[field];
      }
    });
    
    return result as T;
  }

  private static processSection(localizedSection: LocalizedSection): ISection {
    return this.translateLocalized<ISection>(localizedSection);
  }

  private static processSnippets(localizedSnippets: LocalizedSnippet[]): ISnippet[] {
    return sortById(localizedSnippets.map(snippet => 
      this.translateLocalized<ISnippet>(snippet, ['sectionId', 'content', 'type']))
    );
  }

  private static mergeSectionWithSnippets(
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

  static buildSection(
    localizedSection: LocalizedSection,
    localizedSnippets: LocalizedSnippet[]
  ): ISection {
    const section = this.processSection(localizedSection);
    const snippets = this.processSnippets(localizedSnippets);
    return this.mergeSectionWithSnippets(section, snippets);
  }

  static buildSectionBatch(
    localizedSections: ILocalizedSectionWithSnippets[]
  ): ISection[] {
    return localizedSections.map((section) => this.buildSection(section.section, section.snippets) )
  }
}
