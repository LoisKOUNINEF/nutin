#!/usr/bin/env node

import { createApp } from '../lib/index.mjs';

createApp().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
