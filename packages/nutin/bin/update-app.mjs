#!/usr/bin/env node

import { Command } from 'commander';
import { updateAppCommand } from '../lib/index.mjs';

updateAppCommand(new Command()).parseAsync(process.argv).catch((err) => {
  console.error(err instanceof Error ? err.stack : err);
  process.exitCode = 1;
});
