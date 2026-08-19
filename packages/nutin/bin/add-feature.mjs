#!/usr/bin/env node

import { Command } from 'commander';
import { addFeatureCommand } from '../lib/index.mjs';

addFeatureCommand(new Command()).parseAsync(process.argv);
