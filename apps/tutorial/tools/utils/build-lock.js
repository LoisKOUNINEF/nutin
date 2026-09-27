import * as fs from 'fs';
import path from 'path';
import { print } from './print.js';

// Guards the whole build pipeline against concurrent invocations — e.g. a manual
// `npm run build` running alongside the dev watcher's auto-rebuild, or (as actually
// happened) multiple orphaned watcher.js processes each kicking off their own build.
// copy-static.js starts every run by wiping and recreating dist-build; two builds
// doing that at once corrupt each other's output (missing/non-empty dist-build,
// merge-templates.js "has both an inline and external template" conflicts, etc).
const LOCK_DIR = path.resolve('.build-lock');
const STALE_MS = 5 * 60 * 1000; // a full build takes seconds — anything older is a dead leftover
const POLL_MS = 200;
const MAX_WAIT_MS = 2 * 60 * 1000;

function tryAcquire() {
  try {
    fs.mkdirSync(LOCK_DIR);
    fs.writeFileSync(path.join(LOCK_DIR, 'pid'), String(process.pid));
    return true;
  } catch (err) {
    if (err.code === 'EEXIST') return false;
    throw err;
  }
}

function isStale() {
  try {
    const { mtimeMs } = fs.statSync(LOCK_DIR);
    return Date.now() - mtimeMs > STALE_MS;
  } catch {
    return true; // lock vanished mid-check (released concurrently) — treat as free
  }
}

function release() {
  try {
    fs.rmSync(LOCK_DIR, { recursive: true, force: true });
  } catch {
    // already released
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function acquireBuildLock() {
  const start = Date.now();
  let warned = false;

  while (!tryAcquire()) {
    if (isStale()) {
      release();
      continue;
    }

    if (!warned) {
      print.boldInfo('\nAnother build is already in progress — waiting for it to finish...');
      warned = true;
    }

    if (Date.now() - start > MAX_WAIT_MS) {
      throw new Error(`Timed out waiting for the build lock (${LOCK_DIR}) held by another process.`);
    }

    await sleep(POLL_MS);
  }

  process.on('exit', release);
}
