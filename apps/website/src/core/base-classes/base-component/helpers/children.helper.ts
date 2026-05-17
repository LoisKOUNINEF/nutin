import { BaseComponent, ComponentConfig } from '../base-component.js';

declare type Binding = {
  config: ComponentConfig;
  elements: HTMLElement[];
}

export class ChildrenHelper {
  public static addChildren(
    component: BaseComponent,
    element: HTMLElement,
    children: BaseComponent[]
  ): void {
    const configs = component.childConfigs();

    const bindings: Array<Binding> = configs.map(config => ({
      config,
      elements: Array.from(
        element.querySelectorAll(`[data-component="${config.selector}"]`)
      ).filter((el): el is HTMLElement => el instanceof HTMLElement)
    }));

    bindings.forEach(({ config, elements }) => {
      elements.forEach(el => {
        const childComponent = config.factory(el);
        this.registerChild(childComponent, children);
        childComponent.render();
      });
    });
  }

  public static destroyChildren(children: BaseComponent[]): void {
    children.forEach(child => child.destroy());
  }

  private static registerChild(child: BaseComponent, children: BaseComponent[]): void {
    children.push(child);
  }
}
