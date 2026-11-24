#!/usr/bin/env node

import { reportError } from '../lib/src/utils/errors.mjs';
import { Command } from 'commander';
import { createAppCommand } from '../lib/index.mjs';

createAppCommand(new Command()).parseAsync(process.argv).catch((err) => {
  process.exitCode = reportError('Error', err);
});
