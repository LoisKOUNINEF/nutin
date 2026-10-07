import { AppPipeRegistry } from '../../../services/pipe-registry/pipe-registry.js';
import * as DomHelper from './dom.helper.js';

export function parsePipeAttributes(element: HTMLElement): void {
  element.querySelectorAll('[data-pipe]').forEach(el => {
    // Nested components pipe their own content; piping it again here would
    // apply every pipe twice.
    if (DomHelper.isInsideNestedComponent(el, element)) return;

    const pipeRaw = el.getAttribute('data-pipe');
    if (!pipeRaw) return;

    const pipes = pipeRaw.split('|').map(s => s.trim());
    const sourceAttr = el.getAttribute('data-pipe-source');

    processPipes(el, pipes, sourceAttr);
  });
}

function processPipes(
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

    if (!pipeName) {
      console.warn(`Empty pipe name in segment "${pipe}" - skipping.`);
      continue;
    }

    const args = argParts.length ? argParts.join(':').split(',') : [];
    value = AppPipeRegistry.apply(pipeName.trim(), value, args.map(a => a.trim()));
  }

  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    el.value = value;
  } else {
    el.textContent = value;
  }
}
