import { testTemplate } from './test.template.js';

describe('testTemplate', () => {
  it('renders an it.todo stub importing the built output via #root/dist', () => {
    const name = { pascal: 'Widget', kebab: 'widget' };
    const targetPath = 'src/app/components/widget';

    expect(testTemplate(name, targetPath, 'component')).toBe(
      `import { WidgetComponent } from '#root/dist/src/app/components/widget/widget.component.js';

describe('WidgetComponent', () => {
  it.todo('Write tests for WidgetComponent');
});
`
    );
  });

  it('capitalizes only the first letter of the suffix for the "Type" suffix on the class name', () => {
    const name = { pascal: 'Home', kebab: 'home' };
    const targetPath = 'src/app/views/home';

    const result = testTemplate(name, targetPath, 'view');

    expect(result).toContain('HomeView');
    expect(result).toContain("it.todo('Write tests for HomeView');");
  });
});
