#!/usr/bin/env node

import { Command } from 'commander';
import { createAppCommand } from '../lib/index.mjs';

createAppCommand(new Command()).parseAsync(process.argv);
