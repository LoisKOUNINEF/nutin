#!/usr/bin/env node

import { reportError } from '../lib/src/utils/errors.mjs';
import { buildCli } from '../lib/index.mjs';

buildCli().parseAsync(process.argv).catch((err) => {
  process.exitCode = reportError('Error', err);
});
