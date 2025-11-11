import { runCommand, print } from "../../utils/index.js";
import { exit } from 'process';

async function compileTS() {
	runCommand('tsc --project tsconfig.json');
  print.info('TypeScript compiled.');
}

compileTS().catch((err) => {
  print.boldError(`Unexpected error: ${err.message}`);
  exit(1);
});
