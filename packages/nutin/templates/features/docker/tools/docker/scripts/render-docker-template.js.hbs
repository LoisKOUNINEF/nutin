import { readFile, writeFile } from 'fs/promises';
import path from 'path';

// The template with its placeholders substituted, without writing it (docker:build --dry-run).
export async function renderTemplate(dockerDir, templateName, replacements) {
  const templatePath = path.join(dockerDir, templateName);

  let content;
  try {
    content = await readFile(templatePath, 'utf-8');
  } catch {
    throw new Error(`tools/docker/${templateName} not found — re-run "nutin-add docker" or restore the file.`);
  }

  for (const [placeholder, value] of replacements) {
    if (!content.includes(placeholder)) {
      // Nothing to insert: a template from before this token was added still renders.
      if (value === '') continue;
      throw new Error(`tools/docker/${templateName} is missing the "${placeholder}" token — validate-docker has nothing to substitute. Add the token back — "nutin-update" reports the current template's changes.`);
    }
    content = content.replace(placeholder, value);
  }

  return content;
}

export async function renderFromTemplate(dockerDir, templateName, outputName, replacements) {
  const content = await renderTemplate(dockerDir, templateName, replacements);
  await writeFile(path.join(dockerDir, outputName), content);
}
