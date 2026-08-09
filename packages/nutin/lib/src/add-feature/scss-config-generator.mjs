import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function ensureScssConfigFile(fileGenerator, projectPath, context) {
  const templateDir = path.join(__dirname, '..', '..', '..', 'templates', 'base', 'src', 'styles');
  const outputDir = path.join(projectPath, 'src', 'styles');
  await fileGenerator.processTemplateFile(
    path.join(templateDir, '_nutin-config.scss.hbs'),
    outputDir,
    '_nutin-config.scss.hbs',
    context,
    { skipExisting: true },
  );
}
