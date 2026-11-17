/**
 * Works already loaded by the /works list, keyed by id. The case page reads
 * this first so its hero and title can render on the same frame as the
 * click (needed for the FLIP), then fetches the full row in the background.
 */
export const workCache = new Map();
