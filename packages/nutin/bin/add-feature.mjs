#!/usr/bin/env node

import { addFeature } from '../lib/index.mjs';

addFeature().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
