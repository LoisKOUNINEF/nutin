import Handlebars from 'handlebars';
import * as fs from 'fs';

export class TemplateCompiler {
  constructor() {
    this.registerHelpers();
  }

  registerHelpers() {
    Handlebars.registerHelper('and', function(...args) {
      args.pop();
      return args.every(Boolean);
    });
    
    Handlebars.registerHelper('or', function(...args) {
      args.pop();
      return args.some(Boolean);
    });
    
    Handlebars.registerHelper('not', function(value) {
      return !value;
    });

    Handlebars.registerHelper('json', function(context) {
      return JSON.stringify(context, null, 2);
    });
    
    Handlebars.registerHelper('indent', function(text, spaces = 2) {
      const indent = ' '.repeat(spaces);
      return text.split('\n').map(line => indent + line).join('\n');
    });

    Handlebars.registerHelper('eq', function(a, b) {
      return a === b;
    });

    Handlebars.registerHelper('hasAnyFeature', function(options) {
      const context = options.data.root;
      return context.i18n || context.template || context.testing
    });
  }

  async compileFile(templatePath, context) {
    const templateContent = await fs.promises.readFile(templatePath, 'utf8');
    const template = Handlebars.compile(templateContent);
    return template(context);
  }

  compileString(templateString, context) {
    const template = Handlebars.compile(templateString);
    return template(context);
  }
}
