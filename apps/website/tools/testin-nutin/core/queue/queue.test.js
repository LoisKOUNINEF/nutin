import Queue from './queue.js';

describe('Queue', () => {
  it('starts empty', () => {
    const queue = new Queue();
    expect(queue.length).toBe(0);
    expect(queue.deque()).toBe(undefined);
    expect(queue.peek()).toBe(undefined);
  });

  it('dequeues items in FIFO order', () => {
    const queue = new Queue();
    queue.enqueue('a');
    queue.enqueue('b');
    queue.enqueue('c');

    expect(queue.length).toBe(3);
    expect(queue.deque()).toBe('a');
    expect(queue.deque()).toBe('b');
    expect(queue.length).toBe(1);
    expect(queue.deque()).toBe('c');
    expect(queue.length).toBe(0);
  });

  it('peek returns the next item without removing it', () => {
    const queue = new Queue();
    queue.enqueue('first');
    queue.enqueue('second');

    expect(queue.peek()).toBe('first');
    expect(queue.peek()).toBe('first');
    expect(queue.length).toBe(2);
  });

  it('handles a single enqueue/deque cycle and can be reused afterward', () => {
    const queue = new Queue();
    queue.enqueue('only');
    expect(queue.deque()).toBe('only');
    expect(queue.length).toBe(0);
    expect(queue.deque()).toBe(undefined);

    queue.enqueue('again');
    expect(queue.length).toBe(1);
    expect(queue.deque()).toBe('again');
  });
});
