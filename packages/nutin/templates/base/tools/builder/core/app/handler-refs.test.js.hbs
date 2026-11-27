import { addHandlerRefs, removeHandlerRefs, removeEmittedHandlerRefs } from './handler-refs.js';

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
    const { content, entries: [entry] } = addHandlerRefs(VIEW);
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
    const { content, entries: [entry] } = addHandlerRefs(VIEW);
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
    const { content, entries: [entry] } = addHandlerRefs(source);
    expect(entry.className).toBe('CardComponent');
    expect(content.split('\n')[1]).toContain('extends Component<T> { static { void ((c: InstanceType<typeof CardComponent>) => [c._go]); }');
  });

  it('reads every template of generateTemplate(), nested html`` in ${} included', () => {
    const source = [
      'export class CounterComponent extends Component {',
      '  override generateTemplate() {',
      '    if (this.done) return html`<p data-event="click:_reset">Done</p>`;',
      '    return html`<ul>${nutinFor(this.items, (i) => html`<li data-event="click:_pick">${i}</li>`)}</ul>',
      '      <button data-event="click:_inc">+</button>`;',
      '  }',
      '}',
    ].join('\n');
    const { content, entries } = addHandlerRefs(source);
    expect(entries.length).toBe(1);
    expect(entries[0].handlers.map((h) => h.name)).toEqual(['_reset', '_pick', '_inc']);
    expect(entries[0].handlers[2].templateLine).toBe(5);
    expect(content.split('\n')[0]).toBe(
      'export class CounterComponent extends Component { static { void ((c: InstanceType<typeof CounterComponent>) => [c._reset, c._pick, c._inc]); }'
    );
    expect(removeHandlerRefs(content, entries)).toBe(source);
  });

  it('gives each template to the class it sits in, and one outside a class to the class after it', () => {
    const source = [
      'const tags = (t: string[]) => html`<i data-event="click:_tag"></i>`;',
      'class ItemComponent extends Component {',
      '  override generateTemplate() { return html`<b data-event="click:_open"></b>`; }',
      '}',
      'export class ListView extends View {',
      '  override generateTemplate() { return html`<a data-event="click:_more"></a>`; }',
      '}',
    ].join('\n');
    const { content, entries } = addHandlerRefs(source);
    expect(entries.map((e) => [e.className, e.line, e.handlers.map((h) => h.name)])).toEqual([
      ['ItemComponent', 2, ['_tag', '_open']],
      ['ListView', 5, ['_more']],
    ]);
    expect(content.split('\n')[4]).toContain('extends View { static { void ((c: InstanceType<typeof ListView>) => [c._more]); }');
    expect(removeHandlerRefs(content, entries)).toBe(source);
  });

  it('places the references of two classes opened on the same line one after the other', () => {
    const source = 'class A extends B { t() { return html`<i data-event="click:_a"></i>`; } } class C extends B { t() { return html`<i data-event="click:_c"></i>`; } }';
    const { content, entries } = addHandlerRefs(source);
    const [a, c] = entries;
    expect(content.slice(a.handlers[0].col - 1).startsWith('_a]')).toBeTruthy();
    expect(content.slice(c.handlers[0].col - 1).startsWith('_c]')).toBeTruthy();
    expect(c.col).toBe(source.indexOf('class C') + 'class C extends B {'.length + 1 + a.segment.length);
    expect(removeHandlerRefs(content, entries)).toBe(source);
  });

  it('still reads an untagged const template, and skips templates no class follows or precedes', () => {
    const untagged = 'const template = `<i data-event="click:_go"></i>`;\nexport class HomeView extends View {}';
    expect(addHandlerRefs(untagged).entries[0].handlers.map((h) => h.name)).toEqual(['_go']);
    expect(addHandlerRefs('export const t = html`<i data-event="click:_go"></i>`;')).toBe(null);
  });

  it('removes the references from the .js tsc emitted, as tsc prints them', () => {
    const { entries } = addHandlerRefs(VIEW);
    const emitted = [
      'export class TaskView extends View {',
      '    static { void ((c) => [c._save, c._open]); }',
      '    _save() { }',
      '}',
    ].join('\n');
    expect(removeEmittedHandlerRefs(emitted, entries)).toBe('export class TaskView extends View {\n    _save() { }\n}');
    expect(removeEmittedHandlerRefs(emitted.replace(/\n/g, '\r\n'), entries)).toBe('export class TaskView extends View {\r\n    _save() { }\r\n}');
  });

  it('leaves emitted code alone when the references are in another form', () => {
    const { entries } = addHandlerRefs(VIEW);
    const lowered = 'class TaskView extends View {\n}\n(() => { void ((c) => [c._save, c._open]); })();\n';
    expect(removeEmittedHandlerRefs(lowered, entries)).toBe(lowered);
    const other = '    static { void ((c) => [c._save]); }\n';
    expect(removeEmittedHandlerRefs(other, entries)).toBe(other);
  });

  it('removes exactly the injected references', () => {
    const { content, entries } = addHandlerRefs(VIEW);
    expect(removeHandlerRefs(content, entries)).toBe(VIEW);
  });
});
