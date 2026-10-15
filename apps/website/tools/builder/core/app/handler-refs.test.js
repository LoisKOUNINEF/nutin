import { addHandlerRefs, removeHandlerRefs } from './handler-refs.js';

const VIEW = [
  "import { View, html } from '../../../core/index.js';",
  '',
  'const template = html`<div>',
  '  <button data-event="click:_save:@value">Save</button>',
  '  <a data-event=\'click:_open\' data-event-extra="x">Open</a>',
  '  <button data-event="click:_save">Again</button>',
  '</div>`;',
  '',
  'export class TaskView extends View {',
  '  private _save(): void {}',
  '  private _open(): void {}',
  '}',
].join('\n');

describe('handler-refs', () => {
  it('references each data-event handler once, from the class\'s opening line', () => {
    const { content, entry } = addHandlerRefs(VIEW);
    const classLine = content.split('\n')[8];

    expect(classLine).toBe(
      'export class TaskView extends View { static { void ((c: InstanceType<typeof TaskView>) => [c._save, c._open]); }'
    );
    expect(content.split('\n').length).toBe(VIEW.split('\n').length);
    expect(entry.className).toBe('TaskView');
    expect(entry.line).toBe(9);
    expect(entry.handlers.map((h) => h.name)).toEqual(['_save', '_open']);
  });

  it('records where each handler is named in the template and in the injected line', () => {
    const { content, entry } = addHandlerRefs(VIEW);
    const [save, open] = entry.handlers;

    expect(save.templateLine).toBe(4);
    expect(VIEW.split('\n')[3].slice(save.templateCol - 1).startsWith('_save:@value')).toBeTruthy();
    expect(open.templateLine).toBe(5);
    expect(VIEW.split('\n')[4].slice(open.templateCol - 1).startsWith('_open\'')).toBeTruthy();

    const classLine = content.split('\n')[8];
    expect(classLine.slice(save.col - 1).startsWith('_save,')).toBeTruthy();
    expect(classLine.slice(open.col - 1).startsWith('_open]')).toBeTruthy();
  });

  it('skips data-event values built with ${}, and files without handlers', () => {
    const dynamic = VIEW
      .replace('click:_save:@value', 'click:${handler}')
      .replace("'click:_open'", "'click:${other}'")
      .replace('"click:_save"', '"${evt}:_save"');
    expect(addHandlerRefs(dynamic)).toBe(null);
    expect(addHandlerRefs("export class A extends View {}")).toBe(null);
  });

  it('finds the class after the template, even when the markup mentions a class', () => {
    const source = [
      'const templateFn = (t: T) => html`<p class="x">the class Foo extends Bar { }</p><i data-event="click:_go"></i>`;',
      'export class CardComponent<T = string> extends Component<T> {',
      '}',
    ].join('\n');
    const { content, entry } = addHandlerRefs(source);
    expect(entry.className).toBe('CardComponent');
    expect(content.split('\n')[1]).toContain('extends Component<T> { static { void ((c: InstanceType<typeof CardComponent>) => [c._go]); }');
  });

  it('removes exactly the injected references', () => {
    const { content, entry } = addHandlerRefs(VIEW);
    expect(removeHandlerRefs(content, entry)).toBe(VIEW);
  });
});
