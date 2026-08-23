import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const packageJson = require('../../../package.json');

export const PACKAGE_VERSION = packageJson.version;
export const PACKAGE_NAME = packageJson.name;
export const PACKAGE_HOMEPAGE = packageJson.homepage;

export const META_FILE_NAME = '.nutin-meta.json';
