import { computeFileCoverage } from './compute-coverage.js';

describe('computeFileCoverage', () => {
  it('reports 100% when every function and line ran', () => {
    const sourceText = 'function covered() {\n  return 1;\n}\n';
    const scriptResult = {
      functions: [
        { functionName: '', ranges: [{ startOffset: 0, endOffset: sourceText.length, count: 1 }] },
        { functionName: 'covered', ranges: [{ startOffset: 0, endOffset: sourceText.length - 1, count: 3 }] },
      ],
    };

    const { linesPct, functionsPct, branchesPct } = computeFileCoverage(scriptResult, sourceText);
    expect(linesPct).toEqual(100);
    expect(functionsPct).toEqual(100);
    expect(branchesPct).toEqual(100); // no nested ranges anywhere -> defaults to 100
  });

  it('reports 0% for a function that never ran', () => {
    const sourceText = 'function uncovered() {\n  return 1;\n}\n';
    const scriptResult = {
      functions: [
        { functionName: '', ranges: [{ startOffset: 0, endOffset: sourceText.length, count: 1 }] },
        { functionName: 'uncovered', ranges: [{ startOffset: 0, endOffset: sourceText.length - 1, count: 0 }] },
      ],
    };

    const { linesPct, functionsPct } = computeFileCoverage(scriptResult, sourceText);
    expect(linesPct).toEqual(0);
    expect(functionsPct).toEqual(0);
  });

  it('lets a nested 0-count branch override its enclosing covered range', () => {
    const sourceText = 'function branchy(flag) {\n  if (flag) {\n    return 1;\n  }\n  return 2;\n}\n';
    const branchStart = sourceText.indexOf('return 1');
    const branchEnd = sourceText.indexOf(';', branchStart) + 1;

    const scriptResult = {
      functions: [
        { functionName: '', ranges: [{ startOffset: 0, endOffset: sourceText.length, count: 1 }] },
        {
          functionName: 'branchy',
          ranges: [
            { startOffset: 0, endOffset: sourceText.length - 1, count: 5 },
            { startOffset: branchStart, endOffset: branchEnd, count: 0 },
          ],
        },
      ],
    };

    const { linesPct, totalBranches, coveredBranches, branchesPct } = computeFileCoverage(scriptResult, sourceText);
    // every line covered except the never-taken "return 1;" branch
    expect(linesPct).toEqual(5 / 6 * 100);
    expect(totalBranches).toEqual(1);
    expect(coveredBranches).toEqual(0);
    expect(branchesPct).toEqual(0);
  });

  it('derives a name from the source when V8 reports an empty functionName', () => {
    const sourceText = 'class Foo {\n  constructor(x) {\n    this.x = x;\n  }\n}\n';
    const constructorStart = sourceText.indexOf('constructor');
    const constructorEnd = sourceText.indexOf('}', constructorStart) + 1;

    const scriptResult = {
      functions: [
        { functionName: '', ranges: [{ startOffset: 0, endOffset: sourceText.length, count: 1 }] },
        { functionName: '', ranges: [{ startOffset: constructorStart, endOffset: constructorEnd, count: 0 }] },
      ],
    };

    const { uncoveredFunctions } = computeFileCoverage(scriptResult, sourceText);
    expect(uncoveredFunctions).toEqual([{ name: 'constructor', line: 2 }]);
  });
});
