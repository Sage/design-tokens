export function findDuplicates<T>(arr: T[]): T[] {
  const seen = new Set<T>();
  const duplicates: T[] = [];

  for (const item of arr) {
    if (seen.has(item)) {
      duplicates.push(item);
    } else {
      seen.add(item);
    }
  }

  return duplicates;
}

export function getSymetricalDifference<T>(array1: T[], array2: T[]) {
  let difference = array1
    .filter((x) => !array2.includes(x))
    .concat(array2.filter((x) => !array1.includes(x)));

  return Array.from(new Set(difference));
}
