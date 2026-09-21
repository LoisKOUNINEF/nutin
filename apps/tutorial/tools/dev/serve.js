#!/usr/bin/env node

import liveServer from 'live-server';
import { print } from '../utils/index.js';

const params = {
  port: 9090,
  root: 'dist/src',
  open: false, // set to true to open a new window in browser
  logLevel: 0, // 0 = errors only, 1 = some info, 2 = verbose
  entryFile: 'index.html',
  wait: 100, // debounce reloads
  middleware: [
    function(req, res, next) {
      if (req.url.includes('.') && !req.url.endsWith('/')) {
        return next();
      }
      req.url = '/index.html';
      next();
    }
  ]
};

try {
  liveServer.start(params);
} catch (err) {
  if (err.code === 'EADDRINUSE') {
    print.boldError(`Port ${params.port} is already in use — stop the process using it or change the dev port.`);
  } else {
    print.boldError(`live-server failed to start: ${err.message}`);
  }
  process.exit(1);
}
