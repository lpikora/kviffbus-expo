export function compareImportVersions(left: string, right: string): number {
  const parse = (version: string) =>
    version.split(".").map((part) => Number.parseInt(part, 10) || 0);

  const leftParts = parse(left);
  const rightParts = parse(right);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const leftValue = leftParts[index] ?? 0;
    const rightValue = rightParts[index] ?? 0;
    if (leftValue !== rightValue) {
      return leftValue - rightValue;
    }
  }

  return 0;
}

export function isNewerImportVersion(
  candidate: string,
  current: string,
): boolean {
  return compareImportVersions(candidate, current) > 0;
}
