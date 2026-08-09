import os from 'os';
import path from 'path';
import * as fsExtra from 'fs-extra';
import * as tar from 'tar';
import { promiseExec } from './utils.mjs';

const fs = fsExtra.default;

const PACKAGE_NAME = '@nutin/cli';

// Returns the templates/ root for `version` — either a caller-supplied local
// checkout (debug/offline use), or the templates/ bundled in that version's
// published npm tarball. Network/registry failures are surfaced, never swallowed,
// since a wrong "old" baseline would make the whole diff untrustworthy.
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
    // npm's `pack --json` shape has varied across versions: an array of results,
    // or an object keyed by package name. Handle both rather than assuming one.
    const packResult = Array.isArray(parsed) ? parsed[0] : Object.values(parsed)[0];
    tarballName = packResult?.filename;
  } catch (error) {
    await fs.remove(tmpDir);
    throw new Error(
      `Couldn't fetch ${PACKAGE_NAME}@${version} from the npm registry — check your network connection, ` +
      `or pass --from <path> to a local checkout of that version. (${error.message})`,
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
