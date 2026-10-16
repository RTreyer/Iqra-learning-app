/** First value of a route param; expo-router returns an array when a param repeats. */
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
