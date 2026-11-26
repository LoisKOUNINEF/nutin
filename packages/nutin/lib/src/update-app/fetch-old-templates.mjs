import os from 'os';
import path from 'path';
import * as fsExtra from 'fs-extra';
import * as tar from 'tar';
import { promiseExec } from '../utils/promise-exec-alias.mjs';
import { PACKAGE_NAME } from '../common/package-data.mjs';
import { UserError } from '../utils/errors.mjs';
import { assertValidVersion } from './version-compare.mjs';

const fs = fsExtra.default;

export async function fetchOldTemplates(version, { from } = {}) {
  assertValidVersion(version);
  if (from) {
    const templatesRoot = path.resolve(from);
    if (!(await fs.pathExists(templatesRoot))) {
      throw new UserError(`--from path not found: ${templatesRoot}.`);
    }
    return { templatesRoot, cleanup: async () => {} };
  }

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nutin-update-'));

  let tarballName;
  try {
    const { stdout } = await promiseExec(
      `npm pack ${PACKAGE_NAME}@${version} --pack-destination "${tmpDir}" --json`,
      { cwd: tmpDir, maxBuffer: 1024 * 1024 * 10 },
    );
    const parsed = JSON.parse(stdout);
    const packResult = Array.isArray(parsed) ? parsed[0] : Object.values(parsed)[0];
    tarballName = packResult?.filename;
  } catch (error) {
    await fs.remove(tmpDir);
    throw new UserError(`Couldn't fetch ${PACKAGE_NAME}@${version} from the npm registry: ${error.message.trim()}`, {
      hint: `Check your network, or pass --from <path to the templates/ directory of ${PACKAGE_NAME}@${version}>.`,
    });
  }

  if (!tarballName) {
    await fs.remove(tmpDir);
    throw new Error(`npm pack did not report a tarball for ${PACKAGE_NAME}@${version}.`);
  }

  try {
    await tar.x({ file: path.join(tmpDir, tarballName), cwd: tmpDir });
  } catch (error) {
    await fs.remove(tmpDir);
    throw new UserError(`Couldn't extract ${tarballName} for ${PACKAGE_NAME}@${version}: ${error.message}`);
  }

  await fs.remove(path.join(tmpDir, tarballName));

  const templatesRoot = path.join(tmpDir, 'package', 'templates');
  if (!(await fs.pathExists(templatesRoot))) {
    await fs.remove(tmpDir);
    throw new Error(`${PACKAGE_NAME}@${version}'s package didn't contain a templates/ directory.`);
  }

  return {
    templatesRoot,
    cleanup: async () => fs.remove(tmpDir),
  };
}
