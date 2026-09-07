import { View } from '../../../core/index.js';

export abstract class ResourceView extends View {
  protected abstract sections: ISection[];
  protected abstract sectionsIndexSelector: string;
  protected abstract sectionComponentSelector: string;

  constructor({template = '', viewName = 'resource'}) {
    super({ template, viewName });
  }

  onExit(): void {
    this.sections = [];
  }
}
