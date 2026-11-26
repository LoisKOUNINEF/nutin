import fs from 'fs';
import crypto from 'crypto';

// The first 8 hex characters of the file's sha256: the hash in a "<name>.<hash>.<ext>" name,
// which nginx caches as immutable (see tools/docker/nginx.conf.template).
export function hashFile(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 8);
}
