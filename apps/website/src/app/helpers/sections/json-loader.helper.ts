// MIME Type issues

import { sectionManager, snippetsManager, sortById } from '../index.js';

export async function loadSection(
  sectionJsonPath: string,
  snippetsJsonPaths: string[] = []
): Promise<ISection> {
  try {
    const sectionModule = await import(sectionJsonPath, { with: { type: 'json' } });
    const sectionData: LocalizedSection = sectionModule.default;

    const allSnippets: ISnippet[] = [];
    
    for (const snippetPath of snippetsJsonPaths) {
      const snippetModule = await import(snippetPath, { with: { type: 'json' } });
      const snippetData: LocalizedSnippet = snippetModule.default;
      
      const processedSnippets = snippetsManager([snippetData]);
      allSnippets.push(...processedSnippets);
    }

    return sectionManager(sectionData, allSnippets);
  } catch (error) {
    throw new Error(`Failed to load section from ${sectionJsonPath}: ${error}`);
  }
}

export async function loadSections(
  sectionConfigs: Array<{
    sectionPath: string;
    snippetPaths?: string[];
  }>
): Promise<ISection[]> {
  try {
    const sections: ISection[] = [];

    for (const config of sectionConfigs) {
      const section = await loadSection(config.sectionPath, config.snippetPaths || []);
      sections.push(section);
    }

    return sortById(sections);
  } catch (error) {
    throw new Error(`Failed to load sections: ${error}`);
  }
}

export async function autoLoadSections(
  basePath: string,
  sectionConfigs: Array<{
    sectionName: string;
    snippetNames?: string[];
  }>
): Promise<ISection[]> {
  const configs = sectionConfigs.map(({ sectionName, snippetNames = [] }) => ({
    sectionPath: `${basePath}/${sectionName}/${sectionName}.json`,
    snippetPaths: snippetNames.map(snippetName => 
      `${basePath}/${sectionName}/snippets/${snippetName}.json`
    )
  }));

  return loadSections(configs);
}

export async function loadSingleSection(
  basePath: string,
  sectionName: string
): Promise<ISection> {
  const sectionPath = `${basePath}/${sectionName}.json`;
  const snippetsPath = `${basePath}/snippets/${sectionName}.json`;
  
  return loadSection(sectionPath, [snippetsPath]);
}
