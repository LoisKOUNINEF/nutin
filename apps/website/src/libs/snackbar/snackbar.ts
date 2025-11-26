export type NotifyOptions = {
  type?: 'info' | 'success' | 'error';
  position?: 'top' | 'bottom';
  duration?: number;
  actionText?: string;
  onAction?: () => void;
};

type SnackbarItem = {
  message: string;
  options: NotifyOptions;
};

const queue: SnackbarItem[] = [];
let isDisplaying = false;

/**
 * ```typescript
type NotifyOptions = {
  type?: 'info' | 'success' | 'error';
  position?: 'top' | 'bottom';
  duration?: number;
  actionText?: string;
  onAction?: () => void;
};

type SnackbarItem = {
  message: string;
  options: NotifyOptions;
};
```
*/
export function notify(message: string, options: NotifyOptions = {}): void {
  queue.push({ message, options });
  if (!isDisplaying) {
    displayNext();
  }
}

function displayNext(): void {
  if (queue.length === 0) {
    isDisplaying = false;
    return;
  }

  isDisplaying = true;
  const { message, options } = queue.shift()!;
  const { type = 'info', position = 'bottom', duration = 3000, actionText, onAction } = options;

  const snackbar = document.createElement('div');
  snackbar.className = `app-snackbar app-snackbar--${type} app-snackbar--${position}`;
  snackbar.innerHTML = `
    <span>${message}</span>
    ${actionText ? `<button>${actionText}</button>` : ''}
  `;

  document.body.appendChild(snackbar);

  const remove = () => {
    snackbar.remove();
    displayNext();
  };

  if (actionText && onAction) {
    snackbar.querySelector('button')?.addEventListener('click', () => {
      onAction();
      remove();
    });
  }

  setTimeout(remove, duration);
}
