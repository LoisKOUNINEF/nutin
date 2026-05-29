import { AppPipeRegistry } from '../../../index.js';

export class PipeHelper {
  public static parsePipeAttributes(element: HTMLElement): void {
    element.querySelectorAll('[data-pipe]').forEach(el => {
      const pipeRaw = el.getAttribute('data-pipe');
      if (!pipeRaw) return;

      const pipes = pipeRaw.split('|').map(s => s.trim());
      const sourceAttr = el.getAttribute('data-pipe-source');

      this.processPipes(el, pipes, sourceAttr);
    });
  }

  private static processPipes(
    el: Element, 
    pipes: string[], 
    sourceAttr: string | null
  ): void {
    let value: string;

    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      value = sourceAttr !== null ? sourceAttr : el.value;
    } else {
      value = sourceAttr !== null ? sourceAttr : el.textContent || '';
    }

    for (const pipe of pipes) {
      const [pipeName, ...argParts] = pipe.split(':');

      if(!pipeName) return;

      const args = argParts.length ? argParts.join(':').split(',') : [];
      value = AppPipeRegistry.apply(pipeName.trim(), value, args.map(a => a.trim()));
    }

    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      el.value = value;
    } else {
      el.textContent = value;
    }
  }
}
