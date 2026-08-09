#!/usr/bin/env node

import { updateApp } from '../lib/index.mjs';

updateApp().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
