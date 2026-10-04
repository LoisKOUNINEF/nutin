import { getRelToCore } from "../../../utils/get-rel-to-core.js";

export const componentTemplate = (name, targetPath) => {
  const relToCore = getRelToCore(targetPath);
  const htmlTemplate = '__TEMPLATE_PLACEHOLDER__';

  return `import { Component, html } from '${relToCore}';

const templateFn = () => html\`${htmlTemplate}\`;

export class ${name.pascal}Component extends Component {
  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
  }
}
`;
};
