#!/usr/bin/env node

import { Command } from 'commander';
import { createAppCommand } from '../lib/index.mjs';

createAppCommand(new Command()).parseAsync(process.argv).catch((err) => {
  console.error(err instanceof Error ? err.stack : err);
  process.exitCode = 1;
});
