import { getRelToCore } from "../../../utils/get-rel-to-core.js";
import nutinConfig from "../../../../nutin.config.js";

export const viewTemplate = (name, targetPath) => {
  const relToCore = getRelToCore(targetPath);
  
  let htmlTemplate;
  if (nutinConfig.inlineTemplates) {
    htmlTemplate = `<div>${name.pascal} works !</div>`;
  } else {
    htmlTemplate = '__TEMPLATE_PLACEHOLDER__'
  }

  return `import { View } from '${relToCore}';

const template = \`${htmlTemplate}\`;

export class ${name.pascal}View extends View {
  constructor() {
    super({template});
  }

}
`;
}
