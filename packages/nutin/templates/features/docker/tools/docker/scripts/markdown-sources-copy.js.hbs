import path from 'path';

// Markdown folders live outside src/ but build:prod compiles them, so the Docker
// builder stage needs them too. Returns one COPY line per folder ('' without markdown).
export function markdownSourcesCopy(sourceFolders, cwd = process.cwd()) {
  const folders = (sourceFolders ?? [])
    .map((entry) => (typeof entry === 'string' ? entry : entry?.folder))
    .filter(Boolean);

  const relativePaths = folders.map((folder) => {
    const relative = path.relative(cwd, path.resolve(cwd, folder));
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error(`Markdown folder "${folder}" is outside the project, so it can't be copied into the Docker image — move it inside the project.`);
    }
    return relative.split(path.sep).join('/');
  });

  // JSON form keeps folder names with spaces intact.
  return [...new Set(relativePaths)]
    .map((relative) => {
      const target = `./${relative}`;
      return `COPY ${JSON.stringify([target, target])}`;
    })
    .join('\n');
}
