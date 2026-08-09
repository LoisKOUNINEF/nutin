import os from 'os';
import path from 'path';
import * as fsExtra from 'fs-extra';
import * as tar from 'tar';
import { promiseExec } from '../utils/promise-exec-alias.mjs';
import { PACKAGE_NAME } from '../common/package-data.mjs';

const fs = fsExtra.default;

export async function fetchOldTemplates(version, { from } = {}) {
  if (from) {
    const templatesRoot = path.resolve(from);
    if (!(await fs.pathExists(templatesRoot))) {
      throw new Error(`--from path not found: ${templatesRoot}`);
    }
    return { templatesRoot, cleanup: async () => {} };
  }

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nutin-update-'));

  let tarballName;
  try {
    const { stdout } = await promiseExec(
      `npm pack ${PACKAGE_NAME}@${version} --pack-destination "${tmpDir}" --json`,
    );
    const parsed = JSON.parse(stdout);
    const packResult = Array.isArray(parsed) ? parsed[0] : Object.values(parsed)[0];
    tarballName = packResult?.filename;
  } catch (error) {
    await fs.remove(tmpDir);
    throw new Error(
      `Couldn't fetch ${PACKAGE_NAME}@${version} from the npm registry — (${error.message})`,
    );
  }

  if (!tarballName) {
    await fs.remove(tmpDir);
    throw new Error(`npm pack did not report a tarball for ${PACKAGE_NAME}@${version}.`);
  }

  await tar.x({ file: path.join(tmpDir, tarballName), cwd: tmpDir });

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
