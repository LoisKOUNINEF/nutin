import { getRelToCore } from "../../utils/get-rel-to-core.js";

export const componentTemplate = (name, targetPath) => {
  const relToCore = getRelToCore(targetPath);

  return `import { Component } from '${relToCore}';

const templateFn = () => \`<div>${name.pascal} works !</div>\`;

export class ${name.pascal}Component extends Component {
  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
  }
}
`;
};
