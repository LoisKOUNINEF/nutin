import { Session } from 'node:inspector/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import { errorExit } from '../../../utils/index.js';

let session;

export async function startCoverage() {
  try {
    session = new Session();
    session.connect();
    await session.post('Profiler.enable');
    await session.post('Profiler.startPreciseCoverage', { callCount: true, detailed: true });
  } catch (err) {
    errorExit(err, 'coverage/start');
  }
}

export async function stopCoverage(scopedDirs) {
  let result;
  try {
    ({ result } = await session.post('Profiler.takePreciseCoverage'));
    await session.post('Profiler.stopPreciseCoverage');
    await session.post('Profiler.disable');
    session.disconnect();
  } catch (err) {
    errorExit(err, 'coverage/stop');
  }

  return result
    .filter(entry => entry.url.startsWith('file://'))
    .map(entry => ({ ...entry, filePath: fileURLToPath(entry.url) }))
    .filter(({ filePath }) => {
      const rel = path.relative(process.cwd(), filePath);
      if (rel.includes(`node_modules${path.sep}`)) return false;
      if (rel.endsWith('.test.js')) return false;
      return scopedDirs.some(dir => rel.startsWith(dir + path.sep));
    });
}
