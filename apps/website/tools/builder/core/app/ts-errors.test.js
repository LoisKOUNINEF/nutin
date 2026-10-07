import path from 'path';
import { remapTscOutput, mapPosition } from './ts-errors.js';

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
});
