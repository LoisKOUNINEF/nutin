import { execFileSync } from 'child_process';
import * as fs from 'fs';
import path from 'path';
import { ensureDeps, errorExit } from '../../../utils/index.js';
import { PATHS } from '../app/paths.js';
import { builderConfig } from '../../builder.config.js';

await ensureDeps({
  feature: 'Tailwind CSS (tailwind: true)',
  deps: [
    { name: 'tailwindcss', version: '^4.3.0' },
    { name: '@tailwindcss/cli', version: '^4.3.0' },
  ],
  isProd: builderConfig.isProd,
  origin: 'tailwind',
});

// Run the CLI's JS entry with node rather than node_modules/.bin/tailwindcss, which is a
// .cmd shim on Windows that execFileSync can't launch without a shell.
function tailwindEntry() {
  const cliDir = path.join(process.cwd(), 'node_modules', '@tailwindcss', 'cli');
  const { bin } = JSON.parse(fs.readFileSync(path.join(cliDir, 'package.json'), 'utf-8'));
  return path.join(cliDir, typeof bin === 'string' ? bin : bin.tailwindcss);
}

const input = path.join(PATHS.source, 'styles', 'tailwind.css');
const output = path.join(PATHS.tempSource, 'tw-out.css');
const mainCss = path.join(PATHS.tempSource, 'main.css');

const args = [tailwindEntry(), '-i', input, '-o', output, '--silent'];
if (builderConfig.isProd) args.push('--minify');

try {
  execFileSync(process.execPath, args, { stdio: 'inherit' });
} catch (err) {
  errorExit(err, 'tailwind');
}

// Tailwind's @layer blocks always lose to unlayered SCSS in the cascade regardless
// of order, so prepending here is only for readable file ordering, not precedence.
const tailwindCss = fs.readFileSync(output, 'utf-8');
const existingCss = fs.readFileSync(mainCss, 'utf-8');
fs.writeFileSync(mainCss, tailwindCss + '\n' + existingCss);
fs.unlinkSync(output);
