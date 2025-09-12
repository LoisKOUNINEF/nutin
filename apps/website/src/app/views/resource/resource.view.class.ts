import { AppEventBus, View } from '../../../core/index.js';
import { PrismHighlighter } from '../../helpers/index.js';

export abstract class ResourceView extends View {
  protected abstract sections: ISection[];
  protected abstract sectionsIndexSelector: string;
  protected abstract sectionComponentSelector: string;

  constructor({template = ''}) {
    super({template});
    AppEventBus.subscribe('view-mount', this.applyPrism);
  }

  onExit(): void {
    AppEventBus.off('view-mount', this.applyPrism);
    this.sections = [];
  }
  
  private applyPrism(): void {
    PrismHighlighter.apply();
  }
}
