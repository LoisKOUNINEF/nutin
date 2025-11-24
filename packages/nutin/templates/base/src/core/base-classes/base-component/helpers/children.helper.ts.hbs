import { BaseComponent, ComponentConfig } from '../base-component.js';

export class ChildrenHelper {
  public static addChildren(
    component: BaseComponent, 
    element: HTMLElement, 
    children: BaseComponent[]
  ): void {
    const configs: ComponentConfig[] = component.childConfigs();
    configs.forEach(config => {
      element.querySelectorAll(`[data-component="${config.selector}"]`).forEach(el => {
        if (el instanceof HTMLElement) {
          const childComponent = config.factory(el);
          childComponent.render();
          this.registerChild(childComponent, children);
        }
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
