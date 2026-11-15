/**
 * One promise chain for every write to the children's data (progress, profiles), so writes
 * land in the order they were requested: a child's progress saved just before the child is
 * deleted is removed afterwards, never written back after the removal.
 */

function warn(message: string, err: unknown) {
  if (__DEV__) console.warn(`[storage] ${message}`, err);
}

let writeQueue: Promise<void> = Promise.resolve();

export function enqueueWrite(label: string, write: () => Promise<void>): Promise<void> {
  writeQueue = writeQueue.then(write).catch((err) => warn(`${label} failed`, err));
  return writeQueue;
}
