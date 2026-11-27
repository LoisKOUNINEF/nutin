import path from 'path';
import { remapTscOutput, mapPosition, mapHandlerRefs } from './ts-errors.js';

// A view whose placeholder sat on line 4, column 33, replaced by a 3-line .html template.
const MAP = {
  'src/app/views/home/home.view.ts': { html: 'src/app/views/home/home.view.html', line: 4, col: 33, lines: 3 },
};

describe('ts-errors', () => {
  it('maps a position before the template to the same line of the source file', () => {
    expect(mapPosition('src/app/views/home/home.view.ts', 2, 5, MAP)).toEqual({ file: 'src/app/views/home/home.view.ts', line: 2, col: 5 });
  });

  it('maps a position inside the template to the .html file, the first line\'s column shifted', () => {
    expect(mapPosition('src/app/views/home/home.view.ts', 4, 40, MAP)).toEqual({ file: 'src/app/views/home/home.view.html', line: 1, col: 8 });
    expect(mapPosition('src/app/views/home/home.view.ts', 6, 12, MAP)).toEqual({ file: 'src/app/views/home/home.view.html', line: 3, col: 12 });
  });

  it('shifts positions after the template back up by the lines it added', () => {
    expect(mapPosition('src/app/views/home/home.view.ts', 9, 3, MAP)).toEqual({ file: 'src/app/views/home/home.view.ts', line: 7, col: 3 });
  });

  it('leaves files without a merged template as they are', () => {
    expect(mapPosition('src/core/index.ts', 9, 3, MAP)).toEqual({ file: 'src/core/index.ts', line: 9, col: 3 });
  });

  it('rewrites tsc lines from dist-build to the project\'s files and leaves other lines alone', () => {
    const cwd = path.resolve('/project');
    const tempDir = path.join(cwd, 'dist-build');
    const output = [
      "dist-build/src/app/views/home/home.view.ts(5,9): error TS2339: Property 'nmae' does not exist on type 'ITask'.",
      'dist-build/src/core/index.ts(1,1): error TS1000: Something.',
      '  continued message line',
      "node_modules/x/index.d.ts(3,1): error TS2000: Elsewhere.",
    ].join('\n');

    expect(remapTscOutput(output, { cwd, tempDir, templateMap: MAP }).split('\n')).toEqual([
      "src/app/views/home/home.view.html(2,9): error TS2339: Property 'nmae' does not exist on type 'ITask'.",
      'src/core/index.ts(1,1): error TS1000: Something.',
      '  continued message line',
      "node_modules/x/index.d.ts(3,1): error TS2000: Elsewhere.",
    ]);
  });

  // Handler references injected on line 9 from column 31 (see handler-refs.js): "_svae" sits at
  // column 80 of that line, and is written on line 5, column 26 of the merged template.
  const SEGMENT = ' static { void ((c: InstanceType<typeof HomeView>) => [c._svae]); }';
  const REFS = {
    'src/app/views/home/home.view.ts': [{
      className: 'HomeView', line: 9, col: 31, segment: SEGMENT,
      handlers: [{ name: '_svae', col: 31 + SEGMENT.indexOf('_svae'), templateLine: 5, templateCol: 26 }],
    }],
  };

  it('maps an error on an injected handler reference to where the template names it', () => {
    const entries = REFS['src/app/views/home/home.view.ts'];
    const col = entries[0].handlers[0].col;
    expect(mapHandlerRefs(entries, 9, col)).toEqual({ line: 5, col: 26, note: ' (data-event handler "_svae" of HomeView)' });
    expect(mapHandlerRefs(entries, 9, col + 4).line).toBe(5);
  });

  it('shifts positions after the injected references back, and leaves other lines alone', () => {
    const entries = REFS['src/app/views/home/home.view.ts'];
    expect(mapHandlerRefs(entries, 9, 31 + SEGMENT.length + 2)).toEqual({ line: 9, col: 33, note: '' });
    expect(mapHandlerRefs(entries, 9, 12)).toEqual({ line: 9, col: 12, note: '' });
    expect(mapHandlerRefs(entries, 10, 40)).toEqual({ line: 10, col: 40, note: '' });
    expect(mapHandlerRefs(undefined, 9, 40)).toEqual({ line: 9, col: 40, note: '' });
  });

  it('maps positions on a line holding the references of two classes', () => {
    const first = { className: 'A', line: 1, col: 20, segment: 'x'.repeat(10), handlers: [{ name: '_a', col: 25, templateLine: 3, templateCol: 7 }] };
    const second = { className: 'C', line: 1, col: 60, segment: 'y'.repeat(8), handlers: [{ name: '_c', col: 63, templateLine: 4, templateCol: 9 }] };
    const entries = [first, second];
    expect(mapHandlerRefs(entries, 1, 63)).toEqual({ line: 4, col: 9, note: ' (data-event handler "_c" of C)' });
    expect(mapHandlerRefs(entries, 1, 61)).toEqual({ line: 1, col: 49, note: ' (data-event handlers of C)' });
    expect(mapHandlerRefs(entries, 1, 40)).toEqual({ line: 1, col: 30, note: '' });
    expect(mapHandlerRefs(entries, 1, 70)).toEqual({ line: 1, col: 52, note: '' });
    expect(mapHandlerRefs(entries, 1, 21)).toEqual({ line: 1, col: 19, note: ' (data-event handlers of A)' });
  });

  it('reports a handler error at the .html line, with a hint for a parent\'s private handler', () => {
    const cwd = path.resolve('/project');
    const tempDir = path.join(cwd, 'dist-build');
    const col = REFS['src/app/views/home/home.view.ts'][0].handlers[0].col;
    const output = [
      `dist-build/src/app/views/home/home.view.ts(9,${col}): error TS2551: Property '_svae' does not exist on type 'HomeView'. Did you mean '_save'?`,
      `dist-build/src/app/views/home/home.view.ts(9,${col}): error TS2341: Property '_svae' is private and only accessible within class 'Base'.`,
    ].join('\n');

    expect(remapTscOutput(output, { cwd, tempDir, templateMap: MAP, handlerRefs: REFS }).split('\n')).toEqual([
      "src/app/views/home/home.view.html(2,26): error TS2551: Property '_svae' does not exist on type 'HomeView'. Did you mean '_save'? (data-event handler \"_svae\" of HomeView)",
      "src/app/views/home/home.view.html(2,26): error TS2341: Property '_svae' is private and only accessible within class 'Base'. (data-event handler \"_svae\" of HomeView) Declare it protected to use it in a subclass template.",
    ]);
  });
});
