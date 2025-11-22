import { ResourceView } from './resource.view.class.js';
import { ComponentConfig } from '../../../core/index.js';
import { SidebarComponent, SectionComponent } from '../../components/index.js';
import { normalizeString } from '../../helpers/index.js';

export abstract class TopicView extends ResourceView {
  protected externalHref: string = `https://github.com/LoisKOUNINEF/nutin/tree/main/docs`;
  protected hrefI18nKey: string = 'sidebar.link-to-docs';

  private getTopicConfig(configs: ComponentConfig[]): ComponentConfig[] {
    let topicName = '';
    if (this.hasRouteParam('topic')) {
      topicName = normalizeString(this.getRouteParam('topic') || '');
    } else if (this.sections[0]) {
      topicName = normalizeString(this.sections[0].name);
    }
    const topic = this.sections.find((section) => normalizeString(section.name) === topicName);

    if (!topic) return configs;

    return [ ...configs, this.renderTopic(topic) ];    
  }

  private renderTopic(topic: ISection): ComponentConfig {
    return {
      selector: this.sectionComponentSelector,
      factory: (el) => new SectionComponent(el,
        { section: topic },  
        'resource__section'
      )
    };
  }

  private renderSidebar(): ComponentConfig {
    return {
      selector: this.sectionsIndexSelector,
      factory: (el) => new SidebarComponent(el, {
        sections: this.sections, 
        viewName: this.viewName, 
        externalHref: this.externalHref, 
        hrefI18nKey: this.hrefI18nKey,
        routeParams: this.routeParams
      })
    }
  }

  public childConfigs(): ComponentConfig[] {
    const configs: ComponentConfig[] = [ this.renderSidebar() ];
    return this.getTopicConfig(configs);
  }
}
