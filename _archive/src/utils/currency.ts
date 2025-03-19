export function convertToSubcurrency(amount: number, multiplier: number = 100): number {
  return Math.round(amount * multiplier);
} 