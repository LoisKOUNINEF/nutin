import { ThemeToggler, ThemeTogglerService } from '#root/dist/src/app/services/togglers/theme-toggler/theme-toggler.service.js';

const STORAGE_KEY = 'preferred-theme';

const bodyThemes = () => ['light-theme', 'dark-theme'].filter((name) => document.body.classList.contains(name));

// Builds a fresh instance so the constructor re-reads storage / system preference.
// The exported ThemeTogglerService keeps its own state and is never disposed.
function freshToggler() {
  ThemeToggler.getInstance().dispose();
  return ThemeToggler.getInstance();
}

describe('ThemeToggler', () => {
  let toggler;

  beforeAll(() => {
    setupJsdom();
  });

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    if (toggler && toggler !== ThemeTogglerService) toggler.dispose();
    toggler = undefined;
    localStorage.clear();
  });

  it('exports the ThemeToggler singleton', () => {
    expect(ThemeTogglerService).toBeInstanceOf(ThemeToggler);
  });

  it('initTheme applies the stored theme and the transition class', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    ThemeTogglerService.initTheme();
    expect(bodyThemes()).toEqual(['dark-theme']);
    expect(document.body.classList.contains('theme-transition')).toBe(true);
  });

  it('starts in light theme when light is stored', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    toggler = freshToggler();
    expect(toggler.isLightTheme).toBe(true);
    expect(bodyThemes()).toEqual(['light-theme']);
  });

  it('falls back to the system dark preference when nothing is stored', () => {
    const matchMediaSpy = spyOn(window, 'matchMedia').andReturn({ matches: true });
    try {
      toggler = freshToggler();
    } finally {
      matchMediaSpy.restore();
    }
    expect(toggler.isLightTheme).toBe(false);
    expect(bodyThemes()).toEqual(['dark-theme']);
  });

  it('falls back to light when nothing is stored and the system prefers light', () => {
    const matchMediaSpy = spyOn(window, 'matchMedia').andReturn({ matches: false });
    try {
      toggler = freshToggler();
    } finally {
      matchMediaSpy.restore();
    }
    expect(toggler.isLightTheme).toBe(true);
  });

  it('toggleTheme flips the theme, persists it and swaps the body class', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    toggler = freshToggler();

    toggler.toggleTheme();
    expect(toggler.isLightTheme).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    expect(bodyThemes()).toEqual(['dark-theme']);

    toggler.toggleTheme();
    expect(toggler.isLightTheme).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
    expect(bodyThemes()).toEqual(['light-theme']);
  });
});
