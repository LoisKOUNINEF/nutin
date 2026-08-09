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
