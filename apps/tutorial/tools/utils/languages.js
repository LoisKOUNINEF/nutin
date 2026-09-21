import fs from 'fs';
import path from 'path';
import { errorExit } from './error-exit.js';

const langsPath = path.join(process.cwd(), 'config', 'languages.json');

let langs;
try {
  langs = JSON.parse(fs.readFileSync(langsPath, 'utf-8'));
} catch (err) {
  errorExit(new Error(`config/languages.json is missing or malformed: ${err.message}`), 'languages');
}

export const LANGUAGES = langs.languages;
export const DEFAULT_LANGUAGE = langs.defaultLanguage;
