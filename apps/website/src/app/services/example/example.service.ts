import { Service } from "../../../core/index.js";

export class Example extends Service<Example> {
  constructor() {
    super();
    this.registerCallback();
  }

  protected registerCallback(): void { 
    console.debug('No cleanup callbacks registered for service: Example')
  }

  protected onDestroy(): void {
    this.dispose();
  }
}

export const exampleService = Example.getInstance();
