import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export async function renderFromTemplate(dockerDir, templateName, outputName, replacements) {
  const templatePath = path.join(dockerDir, templateName);
  const outputPath = path.join(dockerDir, outputName);

  let content;
  try {
    content = await readFile(templatePath, 'utf-8');
  } catch {
    throw new Error(`tools/docker/${templateName} not found — re-run "nutin-add docker" or restore the file.`);
  }

  for (const [placeholder, value] of replacements) {
    if (!content.includes(placeholder)) {
      throw new Error(`tools/docker/${templateName} is missing the "${placeholder}" token — validate-docker has nothing to substitute. Restore the token or re-run "nutin-add docker".`);
    }
    content = content.replace(placeholder, value);
  }

  await writeFile(outputPath, content);
}
