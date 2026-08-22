export function connectionKey(from: number, to: number): string {
  return String((from << 16) | to);
}
