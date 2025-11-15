import { ResourceView } from './resource.view.class.js';
import { ComponentConfig } from '../../../core/index.js';
import { SidebarComponent, SectionComponent } from '../../components/index.js';
import { normalizeString } from '../../helpers/index.js';

export abstract class TopicView extends ResourceView {
  protected docsLinks: string | undefined;

  private getTopicConfig(configs: ComponentConfig[]): ComponentConfig[] {
    const topicName = normalizeString(this.getRouteParam('topic') || '');
    const topic = this.sections.find((topic) => normalizeString(topic.name) === topicName);

    if (!topic) return configs;

    return [ ...configs, this.renderTopic(topic) ];    
  }

  private renderTopic(topic: ISection): ComponentConfig {
    return {
      selector: this.sectionComponentSelector,
      factory: (el) => new SectionComponent(el, {section: topic},  'resource-section')
    };
  }

  private renderSidebar(): ComponentConfig {
    return {
      selector: this.sectionsIndexSelector,
      factory: (el) => new SidebarComponent(el, {
        sections: this.sections, 
        viewName: this.viewName
      })
    }
  }

  public childConfigs(): ComponentConfig[] {
    const configs: ComponentConfig[] = [ this.renderSidebar() ];

    if (this.hasRouteParam('topic')) {
      return this.getTopicConfig(configs);
    }

    return configs;
  }
}
