import { getRelToCore } from "../../utils/get-rel-to-core.js";

export const serviceTemplate = (name, targetPath) => {
  const relToCore = getRelToCore(targetPath);

  return `import { Service } from '${relToCore}';

export class ${name.pascal} extends Service<${name.pascal}> {  
  constructor() {
    super();
  }

}

export const ${name.pascal}Service = ${name.pascal}.getInstance();
`;
}