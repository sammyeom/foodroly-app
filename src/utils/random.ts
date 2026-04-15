export function pickRandom<T>(items: T[]): T {
  if (items.length === 0) {
    throw new Error('항목이 없습니다.');
  }
  const index = Math.floor(Math.random() * items.length);
  return items[index] as T;
}

export function pickRandomIndex(length: number): number {
  if (length <= 0) return 0;
  return Math.floor(Math.random() * length);
}
