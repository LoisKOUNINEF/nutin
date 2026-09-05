import { Lifecycle, View } from '../../../core/index.js';
import { PrismHighlighter } from '../../helpers/index.js';

export abstract class ResourceView extends View {
  protected abstract sections: ISection[];
  protected abstract sectionsIndexSelector: string;
  protected abstract sectionComponentSelector: string;
  private _unsubViewMount: () => void;

  constructor({template = '', viewName = 'resource'}) {
    super({ template, viewName });
    this._unsubViewMount = Lifecycle.onViewMount(this.applyPrism);
  }

  onExit(): void {
    this._unsubViewMount();
    this.sections = [];
  }
  
  private applyPrism(): void {
    PrismHighlighter.apply();
  }
}
