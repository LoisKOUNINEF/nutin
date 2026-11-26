import { UserError } from '../utils/errors.mjs';
import { PACKAGE_VERSION as packageVersion, META_FILE_NAME } from '../common/package-data.mjs';

export function parseVersion(version) {
  const [major, minor, patch] = version.split('.').map((n) => parseInt(n, 10) || 0);
  return { major, minor, patch };
}

export function compareVersions(a, b) {
  const va = parseVersion(a);
  const vb = parseVersion(b);
  if (va.major !== vb.major) return va.major - vb.major;
  if (va.minor !== vb.minor) return va.minor - vb.minor;
  return va.patch - vb.patch;
}

// meta.version ends up interpolated into a shell command in fetchOldTemplates (npm pack),
// so it must be strictly numeric before anything downstream uses it
// .nutin-meta.json is a plain project file that could be hand-edited or come from an untrusted clone.
export function assertValidVersion(version) {
  if (typeof version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version)) {
    throw new UserError(
      `${META_FILE_NAME} has an invalid version ${JSON.stringify(version)} — expected a version in major.minor.patch format, e.g. "${packageVersion}". ` +
      `Fix or delete ${META_FILE_NAME} and try again.`,
    );
  }
}
