import { getRelToCore } from "../../utils/get-rel-to-core.js";

export const viewTemplate = (name, targetPath) => {
  const relToCore = getRelToCore(targetPath);

  return `import { View } from '${relToCore}';

const template = \`<div>${name.pascal} works !</div>\`;

export class ${name.pascal}View extends View {
  constructor() {
    super({template});
  }

}
`;
}
