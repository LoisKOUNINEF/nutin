import { AppPipeRegistry } from '#root/dist/src/core/services/index.js';
import { registerPipes } from '#root/dist/src/core/services/pipe-registry/pipes.js';

describe('PipeRegistry', () => {
	it('should be defined', () => {
		expect(AppPipeRegistry).toBeDefined();
	});

	it('register() makes a pipe available via apply()', () => {
		AppPipeRegistry.register('reverse-test', (value) => String(value).split('').reverse().join(''));
		expect(AppPipeRegistry.apply('reverse-test', 'abc')).toBe('cba');
	});

	it('apply() passes extra args through to the pipe function', () => {
		AppPipeRegistry.register('pad-test', (value, char) => `${char}${value}${char}`);
		expect(AppPipeRegistry.apply('pad-test', 'x', ['*'])).toBe('*x*');
	});

	it('register() keeps the original implementation when the name is already registered', () => {
		const warnSpy = spyOn(console, 'warn');
		warnSpy.andCallFake(() => {});

		AppPipeRegistry.register('dup-test', () => 'first');

		AppPipeRegistry.register('dup-test', () => 'second');

		expect(AppPipeRegistry.apply('dup-test', 'ignored')).toBe('first');

		expect(warnSpy.callCount).toBe(1);
		warnSpy.restore();
	});

	it('apply() warns and returns the raw value when the pipe is not registered', () => {
		const warnSpy = spyOn(console, 'warn');
		warnSpy.andCallFake(() => {});

		const result = AppPipeRegistry.apply('does-not-exist', 'raw-value');

		expect(result).toBe('raw-value');
		expect(warnSpy.callCount).toBe(1);

		warnSpy.restore();
	});

	it('onDestroy() clears all registered pipes', () => {
		AppPipeRegistry.register('clear-test', (v) => v);
		expect(AppPipeRegistry.apply('clear-test', 'x')).toBe('x');

		AppPipeRegistry.onDestroy();

		const warnSpy = spyOn(console, 'warn');
		warnSpy.andCallFake(() => {});

		expect(AppPipeRegistry.apply('clear-test', 'x')).toBe('x');
		expect(warnSpy.callCount).toBe(1);

		warnSpy.restore();

		// AppPipeRegistry is a process-wide singleton shared by every test suite,
		// so destroying it here would otherwise leak into every suite that runs
		// afterward and relies on the app's pipes already being registered. Silenced
		// since this can legitimately re-hit an "already exists" warning per pipe if
		// some other suite re-registers them again later in the run.
		silenceConsole('warn', () => registerPipes());
	});
});
