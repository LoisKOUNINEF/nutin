#!/usr/bin/env node

import { reportError } from '../lib/src/utils/errors.mjs';
import { Command } from 'commander';
import { addFeatureCommand } from '../lib/index.mjs';

addFeatureCommand(new Command()).parseAsync(process.argv).catch((err) => {
  process.exitCode = reportError('Error', err);
});
