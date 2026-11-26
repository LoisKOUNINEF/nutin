import fs from 'fs';
import path from 'path';
import { errorExit } from '../../../utils/index.js';

// V8 ranges within a script are always disjoint or strictly nested, never partially
// overlapping. The smallest range containing an offset holds the true execution count
// for that offset - e.g. "this function ran 5x but this one branch inside it ran 0x".
function countAt(offset, ranges) {
  let best = null;
  for (const range of ranges) {
    if (offset < range.startOffset || offset >= range.endOffset) continue;
    if (!best || (range.endOffset - range.startOffset) < (best.endOffset - best.startOffset)) {
      best = range;
    }
  }
  return best ? best.count : 0;
}

function buildLineStarts(sourceText) {
  const starts = [0];
  for (let i = 0; i < sourceText.length; i++) {
    if (sourceText[i] === '\n') starts.push(i + 1);
  }
  return starts;
}

function offsetToLine(offset, lineStarts) {
  let lo = 0, hi = lineStarts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (lineStarts[mid] <= offset) lo = mid; else hi = mid - 1;
  }
  return lo + 1; // 1-indexed
}

// V8 sometimes reports an empty functionName (e.g. accessors, unnamed callbacks).
// Fall back to reading the source at the function's own start offset instead of a
// meaningless placeholder - covers `constructor(`, `get foo(`, method names, etc.
// Only treat a leading identifier as a real name when it's immediately followed by
// `(` (a param list) - otherwise it's just an arrow function's bare parameter (e.g.
// `c => ...`), which isn't a name at all, so fall through to a source snippet instead.
function deriveLabel(sourceText, startOffset) {
  const snippet = sourceText.slice(startOffset, startOffset + 60);
  const named = snippet.match(/^\s*(?:get |set )?([A-Za-z_$][\w$]*)\s*\(/);
  if (named) return named[1];
  return snippet.trim().split('\n')[0].slice(0, 30) || '<anonymous>';
}

// What ran in one script, keyed so that the coverage of the same file from several isolates
// (the main thread and the workers of testinNutin.isolate) can be merged:
// lines by number, functions by start offset, branches by range.
function collectFileCoverage({ functions }, sourceText) {
  const allRanges = functions.flatMap(fn => fn.ranges);
  const lineStarts = buildLineStarts(sourceText);

  // Line coverage: sample the count at each line's first non-whitespace character.
  // Not statement/branch-accurate, but simple and good enough for a lightweight report.
  const lines = new Map();
  let offset = 0;
  for (const line of sourceText.split('\n')) {
    const firstChar = line.search(/\S/);
    if (firstChar !== -1) {
      lines.set(offsetToLine(offset + firstChar, lineStarts), countAt(offset + firstChar, allRanges) > 0);
    }
    offset += line.length + 1;
  }

  // Function coverage: every functions[] entry except the whole-script pseudo-function,
  // identified by its first range spanning the entire file.
  const realFunctions = functions.filter(fn => {
    const [topRange] = fn.ranges;
    return !(topRange.startOffset === 0 && topRange.endOffset === sourceText.length);
  });
  const functionsByStart = new Map(realFunctions.map(fn => [fn.ranges[0].startOffset, {
    name: fn.functionName || deriveLabel(sourceText, fn.ranges[0].startOffset),
    line: offsetToLine(fn.ranges[0].startOffset, lineStarts),
    covered: fn.ranges[0].count > 0,
  }]));

  // Branch coverage: every range beyond a function's own top-level range (index 0)
  // is a nested conditional block V8 already tracked while collecting detailed
  // coverage: if/else arms, ternary branches, switch cases, logical short-circuits,
  // loop bodies. No AST parsing needed, just reusing data already being collected.
  // V8 only reports them for functions that ran in that isolate.
  const branches = new Map(functions.flatMap(fn => fn.ranges.slice(1)).map(r => [`${r.startOffset}:${r.endOffset}`, {
    startOffset: r.startOffset,
    line: offsetToLine(r.startOffset, lineStarts),
    covered: r.count > 0,
  }]));

  return { lines, functions: functionsByStart, branches, allRanges };
}

// Covered in any isolate means covered.
// A function that ran is always listed with its count, so a missing one didn't run there.
// A branch is not: V8 drops a block range whose count equals its parent's,
// and keeps the ranges that differ, which depend on the calls made in that isolate.
// So a branch range from another isolate is looked up by offset, like a line.
function mergeCollected(collected) {
  const lines = new Map();
  const functions = new Map();
  const branches = new Map();

  for (const item of collected) {
    for (const [line, covered] of item.lines) lines.set(line, Boolean(lines.get(line)) || covered);
    for (const [start, fn] of item.functions) {
      const seen = functions.get(start);
      functions.set(start, seen ? { ...seen, covered: seen.covered || fn.covered } : fn);
    }
    for (const [key, branch] of item.branches) if (!branches.has(key)) branches.set(key, branch);
  }

  for (const [key, branch] of branches) {
    const covered = collected.some(item => item.branches.has(key)
      ? item.branches.get(key).covered
      : countAt(branch.startOffset, item.allRanges) > 0);
    branches.set(key, { ...branch, covered });
  }

  return { lines, functions, branches };
}

function summarize({ lines, functions, branches }) {
  const lineEntries = [...lines].sort(([a], [b]) => a - b);
  const totalLines = lineEntries.length;
  const coveredLines = lineEntries.filter(([, covered]) => covered).length;
  const uncoveredLines = lineEntries.filter(([, covered]) => !covered).map(([line]) => line);

  const functionList = [...functions.values()];
  const coveredFunctions = functionList.filter(fn => fn.covered).length;
  const uncoveredFunctions = functionList
    .filter(fn => !fn.covered)
    .map(({ name, line }) => ({ name, line }));

  const branchList = [...branches.values()];
  const coveredBranches = branchList.filter(b => b.covered).length;
  const uncoveredBranches = branchList
    .filter(b => !b.covered)
    .map(b => b.line)
    .sort((a, b) => a - b);

  return {
    totalLines, coveredLines, uncoveredLines,
    linesPct: totalLines ? (coveredLines / totalLines) * 100 : 100,
    totalBranches: branchList.length, coveredBranches, uncoveredBranches,
    branchesPct: branchList.length ? (coveredBranches / branchList.length) * 100 : 100,
    totalFunctions: functionList.length, coveredFunctions, uncoveredFunctions,
    functionsPct: functionList.length ? (coveredFunctions / functionList.length) * 100 : 100,
  };
}

// One script's V8 coverage, or several of the same file (one per isolate), merged.
export function computeFileCoverage(entries, sourceText) {
  const list = Array.isArray(entries) ? entries : [entries];
  const collected = list.map(entry => collectFileCoverage(entry, sourceText));
  return summarize(collected.length === 1 ? collected[0] : mergeCollected(collected));
}

export function buildCoverageReport(scopedResults) {
  const entriesByFile = new Map();
  for (const entry of scopedResults) {
    if (!entriesByFile.has(entry.filePath)) entriesByFile.set(entry.filePath, []);
    entriesByFile.get(entry.filePath).push(entry);
  }

  return [...entriesByFile].map(([filePath, entries]) => {
    let sourceText;
    try {
      sourceText = fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
      errorExit(err, 'coverage/compute-coverage');
    }
    const coverage = computeFileCoverage(entries, sourceText);
    return { file: path.relative(process.cwd(), filePath), ...coverage };
  });
}
