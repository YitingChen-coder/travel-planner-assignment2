export function nextTab(current: number, key: string, count: number): number {
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  if (key === 'ArrowRight') return (current + 1) % count;
  if (key === 'ArrowLeft') return (current + count - 1) % count;
  return current;
}
export function toggleFilter(selected: string[], value: string): string[] {
  return selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value];
}
export function validateDestination(value: string): string | null {
  if (!value.trim()) return 'Enter a destination to continue.';
  if (value.trim().length < 2) return 'Use at least two characters.';
  return null;
}
export const questCheckpoints = [
  { id: 'market', label: 'Visit the market', reward: 100 },
  { id: 'lantern', label: 'Find the lantern lane', reward: 80 },
  { id: 'music', label: 'Hear a street performance', reward: 100 },
];
export function questProgress(completed: string[]) {
  const earned = questCheckpoints.filter(checkpoint => completed.includes(checkpoint.id));
  return { xp: 720 + earned.reduce((sum, checkpoint) => sum + checkpoint.reward, 0), completed: earned.length, unlocked: earned.length === questCheckpoints.length };
}
export function contrastRatio(first: string, second: string): number {
  function luminance(hex: string) {
    const rgb = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255)
      .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
  }
  const a = luminance(first), b = luminance(second);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}
