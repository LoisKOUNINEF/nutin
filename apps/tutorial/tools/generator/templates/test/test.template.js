export const testTemplate = (name, targetPath, suffix) => {
  const type = suffix.charAt(0).toUpperCase() + suffix.slice(1);

  return `import { ${name.pascal}${type} } from '#root/dist/${targetPath}/${name.kebab}.${suffix}.js';

describe('${name.pascal}${type}', () => {
  it.todo('Write tests for ${name.pascal}${type}');
});
`;
}
