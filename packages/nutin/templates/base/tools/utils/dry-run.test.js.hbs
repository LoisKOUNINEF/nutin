import { isDryRun } from './dry-run.js';

describe('dry-run', () => {
  it('is on with --dry-run in argv', () => {
    expect(isDryRun(['node', 'script.js', 'component', 'x', '--dry-run'], {})).toBe(true);
  });

  it('is on when npm took --dry-run as its own option (npm_config_dry_run)', () => {
    expect(isDryRun(['node', 'script.js'], { npm_config_dry_run: 'true' })).toBe(true);
  });

  it('is on in a script started by runScript (NUTIN_DRY_RUN)', () => {
    expect(isDryRun(['node', 'script.js', '--silent'], { NUTIN_DRY_RUN: '1' })).toBe(true);
  });

  it('is off otherwise', () => {
    expect(isDryRun(['node', 'script.js', '--dry'], {})).toBe(false);
    expect(isDryRun(['node', 'script.js'], { npm_config_dry_run: 'false', NUTIN_DRY_RUN: '0' })).toBe(false);
  });
});
