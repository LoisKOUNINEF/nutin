#!/usr/bin/env node

import { buildCli } from '../lib/index.mjs';

buildCli().parseAsync(process.argv);
