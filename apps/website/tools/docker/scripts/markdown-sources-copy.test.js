import path from 'path';
import { markdownSourcesCopy } from './markdown-sources-copy.js';

describe('markdownSourcesCopy', () => {
  const cwd = path.resolve('/project');

  it('returns an empty string without markdown folders', () => {
    expect(markdownSourcesCopy(undefined, cwd)).toBe('');
    expect(markdownSourcesCopy([], cwd)).toBe('');
  });

  it('returns one COPY line per folder, for string and object entries', () => {
    expect(markdownSourcesCopy(['markdown-content', { folder: 'docs/guides' }], cwd)).toBe(
      'COPY ["./markdown-content","./markdown-content"]\nCOPY ["./docs/guides","./docs/guides"]'
    );
  });

  it('keeps folder names with spaces in a single path', () => {
    expect(markdownSourcesCopy(['my docs'], cwd)).toBe('COPY ["./my docs","./my docs"]');
  });

  it('copies a folder once when it is listed with different spellings', () => {
    expect(markdownSourcesCopy(['docs', './docs/', { folder: 'docs' }], cwd)).toBe('COPY ["./docs","./docs"]');
  });

  it('skips entries without a folder', () => {
    expect(markdownSourcesCopy([null, {}, 'docs'], cwd)).toBe('COPY ["./docs","./docs"]');
  });

  it('throws for a folder outside the project', () => {
    expect(() => markdownSourcesCopy(['../shared-docs'], cwd)).toThrow('"../shared-docs" is outside the project');
    expect(() => markdownSourcesCopy([path.resolve('/elsewhere/docs')], cwd)).toThrow('is outside the project');
  });
});
