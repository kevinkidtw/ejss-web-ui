/**
 * Fixed-capacity circular ring buffer.
 * Provides O(1) push, O(1) count, and in-order traversal with zero allocations during push.
 */
export class RingBuffer<T> {
  private buffer: (T | undefined)[];
  private head = 0;
  private count = 0;
  readonly capacity: number;

  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new Error('RingBuffer capacity must be > 0');
    }
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  get length(): number {
    return this.count;
  }

  get isFull(): boolean {
    return this.count === this.capacity;
  }

  push(item: T): void {
    if (this.count < this.capacity) {
      this.buffer[(this.head + this.count) % this.capacity] = item;
      this.count++;
    } else {
      this.buffer[this.head] = item;
      this.head = (this.head + 1) % this.capacity;
    }
  }

  toArray(): T[] {
    const result: T[] = new Array(this.count);
    for (let i = 0; i < this.count; i++) {
      result[i] = this.buffer[(this.head + i) % this.capacity]!;
    }
    return result;
  }

  forEach(fn: (item: T, index: number) => void): void {
    for (let i = 0; i < this.count; i++) {
      fn(this.buffer[(this.head + i) % this.capacity]!, i);
    }
  }

  clear(): void {
    this.buffer.fill(undefined);
    this.head = 0;
    this.count = 0;
  }
}
