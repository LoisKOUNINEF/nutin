import { runCommand, print, isVerbose } from "../../utils/index.js";
import { exit } from 'process';

async function compileTS() {
	await runCommand('tsc', ['--project', 'tsconfig.json']);
  if (isVerbose) print.boldInfo('TypeScript compiled.\n');
}

compileTS().catch((err) => {
  print.boldError(`Unexpected error: ${err.message}`);
  exit(1);
});
