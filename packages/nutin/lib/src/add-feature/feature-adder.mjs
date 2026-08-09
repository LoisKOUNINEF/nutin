import path from 'path';
import { fileURLToPath } from 'url';
import * as fsExtra from 'fs-extra';
import { print } from '../utils/print.mjs';
import { FileGenerator } from '../common/file-generator.mjs';
import { FEATURES } from '../common/feature-registry.mjs';
import { getCiCommand, getDeployHelperScripts, getTestinNutinScripts, getTestinNutinExtras, detectPackageManager } from '../common/package-json-helper.mjs';
import { PACKAGE_VERSION } from '../common/package-data.mjs';
import { updateProjectMeta } from '../common/project-meta.mjs';

const fs = fsExtra.default;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fileGenerator = new FileGenerator();
const nutinConfigFileName = 'nutin.config.js';

async function validateProject(projectPath, feature) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (!(await fs.pathExists(packageJsonPath))) {
    throw new Error(`No package.json found in ${projectPath} — run this from a nutin project's root.`);
  }
  if (feature.scssForward && !(await fs.pathExists(path.join(projectPath, 'src', 'libs')))) {
    throw new Error(`No src/libs directory found in ${projectPath} — is this a nutin project?`);
  }
}

async function buildContext(projectPath, feature) {
  const packageJson = await fs.readJSON(path.join(projectPath, 'package.json'));
  const packageManager = await detectPackageManager(projectPath);

  return {
    projectName: packageJson.name,
    packageManager,
    ciCommand: getCiCommand(packageManager),
    version: PACKAGE_VERSION,
    [feature.key]: true,
  };
}

async function appendLineIfMissing(filePath, line) {
  if (!(await fs.pathExists(filePath))) {
    print.section(`⚠️  Skipped (not found): ${path.basename(filePath)}`);
    return false;
  }

  const content = await fs.readFile(filePath, 'utf8');
  if (content.includes(line)) {
    return false;
  }

  const separator = content.length === 0 || content.endsWith('\n') ? '' : '\n';
  await fs.writeFile(filePath, `${content}${separator}${line}\n`);
  print.info(`Updated ${path.basename(filePath)}`);
  return true;
}

async function ensureLibsUseInMainScss(mainScssPath) {
  if (!(await fs.pathExists(mainScssPath))) {
    return false;
  }

  const content = await fs.readFile(mainScssPath, 'utf8');
  if (content.includes('@use "../libs";')) {
    return true;
  }

  const block = '// libs - using partials to ensure proper stacking context\n@use "../libs";\n\n';
  const marker = '// global styles';
  const updated = content.includes(marker) ? content.replace(marker, `${block}${marker}`) : `${block}${content}`;

  await fs.writeFile(mainScssPath, updated);
  print.info(`Updated ${path.basename(mainScssPath)}`);
  return true;
}

async function ensureScssConfigFile(projectPath, context) {
  const templateDir = path.join(__dirname, '..', '..', 'templates', 'base', 'src', 'styles');
  const outputDir = path.join(projectPath, 'src', 'styles');
  await fileGenerator.processTemplateFile(
    path.join(templateDir, '_nutin-config.scss.hbs'),
    outputDir,
    '_nutin-config.scss.hbs',
    context,
    { skipExisting: true },
  );
}

async function updateLibBarrels(projectPath, feature) {
  if (feature.tsExport) {
    await appendLineIfMissing(path.join(projectPath, 'src', 'libs', 'index.ts'), feature.tsExport);
  }
  if (feature.scssForward) {
    await appendLineIfMissing(path.join(projectPath, 'src', 'libs', '_index.scss'), feature.scssForward);
    await ensureLibsUseInMainScss(path.join(projectPath, 'src', 'styles', 'main.scss'));
  }
}

async function getTestinNutinConfigBlock() {
  const templatePath = path.join(__dirname, '..', '..', 'templates', 'base', `${nutinConfigFileName}.hbs`);
  const raw = await fs.readFile(templatePath, 'utf8');
  const startMarker = '{{#if testinNutin}}';
  const endMarker = '{{/if}}';
  const start = raw.indexOf(startMarker);
  const end = raw.indexOf(endMarker, start);

  if (start === -1 || end === -1) {
    return null;
  }

  return raw.slice(start + startMarker.length, end).trim();
}

async function ensureTestinNutinConfigBlock(nutinConfigPath) {
  if (!(await fs.pathExists(nutinConfigPath))) {
    print.section(`⚠️  Skipped (not found): ${path.basename(nutinConfigPath)}`);
    return false;
  }

  const content = await fs.readFile(nutinConfigPath, 'utf8');
  if (content.includes('testinNutin:')) {
    return false;
  }

  const block = await getTestinNutinConfigBlock();
  if (!block) {
    return false;
  }

  const lastBraceIndex = content.lastIndexOf('}');
  const updated = `${content.slice(0, lastBraceIndex)}  ${block}\n${content.slice(lastBraceIndex)}`;

  await fs.writeFile(nutinConfigPath, updated);
  print.info(`Updated ${path.basename(nutinConfigPath)}`);
  return true;
}

function mergeAdditive(target, additions) {
  const merged = { ...target };
  const added = [];
  const skipped = [];

  for (const [key, value] of Object.entries(additions)) {
    if (Object.prototype.hasOwnProperty.call(merged, key)) {
      skipped.push(key);
    } else {
      merged[key] = value;
      added.push(key);
    }
  }

  return { merged, added, skipped };
}

async function updatePackageJson(projectPath, feature, context) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = await fs.readJSON(packageJsonPath);

  let scripts = {};
  let extras = {};

  if (feature.key === 'deployHelper') {
    scripts = getDeployHelperScripts(context);
  } else if (feature.key === 'testinNutin') {
    scripts = getTestinNutinScripts(context);
    extras = getTestinNutinExtras();
  } else {
    return;
  }

  const scriptsResult = mergeAdditive(packageJson.scripts ?? {}, scripts);
  const devDepsResult = mergeAdditive(packageJson.devDependencies ?? {}, extras.devDependencies ?? {});
  const importsResult = mergeAdditive(packageJson.imports ?? {}, extras.imports ?? {});
  const enginesResult = mergeAdditive(packageJson.engines ?? {}, extras.engines ?? {});

  packageJson.scripts = scriptsResult.merged;
  if (extras.devDependencies) packageJson.devDependencies = devDepsResult.merged;
  if (extras.imports) packageJson.imports = importsResult.merged;
  if (extras.engines) packageJson.engines = enginesResult.merged;

  await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 });

  const skipped = [...scriptsResult.skipped, ...devDepsResult.skipped, ...importsResult.skipped, ...enginesResult.skipped];
  if (skipped.length > 0) {
    print.section(`⚠️  Kept existing package.json values for: ${skipped.join(', ')}`);
  }
  print.info('Updated package.json');
}

export async function addFeatureToProject(featureKey) {
  const feature = FEATURES.find((candidate) => candidate.key === featureKey);
  if (!feature) {
    throw new Error(`Unknown feature: ${featureKey}`);
  }

  const projectPath = process.cwd();
  await validateProject(projectPath, feature);

  print.boldHead(`\nAdding ${feature.key} to ${projectPath}...\n`);

  const context = await buildContext(projectPath, feature);
  const featureTemplateDir = path.join(__dirname, '..', '..', 'templates', 'features', feature.key);

  await fileGenerator.processTemplateDirectory(featureTemplateDir, projectPath, context, { skipExisting: true });
  await updateLibBarrels(projectPath, feature);
  await updatePackageJson(projectPath, feature, context);

  if (feature.key === 'accessibilityComponents' || feature.key === 'forms' || feature.key === 'overlays') {
    await ensureScssConfigFile(projectPath, context);
  }

  if (feature.key === 'testinNutin') {
    await ensureTestinNutinConfigBlock(path.join(projectPath, nutinConfigFileName));
  }

  if (feature.key === 'forms' || feature.key === 'overlays') {
    await addFeatureToProject('accessibilityComponents');
  }

  await updateProjectMeta(projectPath, {
    version: PACKAGE_VERSION,
    packageManager: context.packageManager,
    features: { [feature.key]: true },
  });

  print.boldSuccess(`✅ ${feature.key} added.`);
}
