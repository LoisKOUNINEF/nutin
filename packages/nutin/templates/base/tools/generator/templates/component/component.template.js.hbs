import { getRelToCore } from "../../../utils/get-rel-to-core.js";
import nutinConfig from "../../../../nutin.config.js";

export const componentTemplate = (name, targetPath) => {
  const relToCore = getRelToCore(targetPath);
  
  let htmlTemplate;
  if (nutinConfig.inlineTemplates) {
    htmlTemplate = `<div>${name.pascal} works !</div>`;
  } else {
    htmlTemplate = '__TEMPLATE_PLACEHOLDER__'
  }

  return `import { Component } from '${relToCore}';

const templateFn = () => \`${htmlTemplate}\`;

export class ${name.pascal}Component extends Component {
  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
  }
}
`;
};
