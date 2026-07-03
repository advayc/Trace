/** Stagger delay in ms for list / grid entrance animations. */
export function staggerDelay(index: number, stepMs = 60): number {
  return index * stepMs;
}
