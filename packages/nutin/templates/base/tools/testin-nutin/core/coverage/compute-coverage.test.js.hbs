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

  // V8's ranges for this source, as reported by one isolate that called outer(true) and
  // another that called outer(false): each lists only the branch it didn't take.
  const mergeSource = "export function outer(flag) {\n  function innerNeverCalled() { return 1; }\n  if (flag) { return 'a'; }\n  return 'b';\n}\n";
  const script = (outer, inner = []) => ({
    functions: [
      { functionName: '', ranges: [{ startOffset: 0, endOffset: 118, count: 1 }] },
      { functionName: 'outer', ranges: outer.map(([startOffset, endOffset, count]) => ({ startOffset, endOffset, count })) },
      ...inner,
    ],
  });
  const innerNeverCalled = { functionName: 'innerNeverCalled', ranges: [{ startOffset: 32, endOffset: 73, count: 0 }] };
  const calledWithTrue = script([[7, 117, 1], [101, 116, 0]], [innerNeverCalled]);
  const calledWithFalse = script([[7, 117, 1], [86, 101, 0]], [innerNeverCalled]);
  const notCalled = script([[7, 117, 0]]);

  it('merges isolates: a branch one isolate omits is covered if its offset ran there', () => {
    expect(mergeSource.length).toBe(118);
    const merged = computeFileCoverage([calledWithTrue, calledWithFalse], mergeSource);
    expect(merged.totalBranches).toBe(2);
    expect(merged.coveredBranches).toBe(2);
    expect(merged.uncoveredLines).toEqual([2]);
  });

  it('merges isolates: a function is covered when it ran in any of them', () => {
    const merged = computeFileCoverage([notCalled, calledWithTrue], mergeSource);
    expect(merged.totalFunctions).toBe(2);
    expect(merged.coveredFunctions).toBe(1);
    expect(merged.uncoveredFunctions).toEqual([{ name: 'innerNeverCalled', line: 2 }]);
    // outer(false) never ran: its branch stays uncovered.
    expect(merged.uncoveredBranches).toEqual([3]);
  });

  it('merges isolates: nothing ran in any of them', () => {
    const merged = computeFileCoverage([notCalled, notCalled], mergeSource);
    expect(merged.coveredLines).toBe(1); // only the export line, at module level
    expect(merged.coveredFunctions).toBe(0);
  });

  it('gives a single entry passed in an array the same result', () => {
    expect(computeFileCoverage([calledWithTrue], mergeSource)).toEqual(computeFileCoverage(calledWithTrue, mergeSource));
  });
});
