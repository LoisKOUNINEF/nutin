#!/usr/bin/env node

import { Command } from 'commander';
import { addFeatureCommand } from '../lib/index.mjs';

addFeatureCommand(new Command()).parseAsync(process.argv).catch((err) => {
  console.error(err instanceof Error ? err.stack : err);
  process.exitCode = 1;
});
