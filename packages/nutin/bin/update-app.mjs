#!/usr/bin/env node

import { Command } from 'commander';
import { updateAppCommand } from '../lib/index.mjs';

updateAppCommand(new Command()).parseAsync(process.argv);
