#!/usr/bin/env node

import { buildCli } from '../lib/index.mjs';

buildCli().parseAsync(process.argv).catch((err) => {
  console.error(err instanceof Error ? err.stack : err);
  process.exitCode = 1;
});
