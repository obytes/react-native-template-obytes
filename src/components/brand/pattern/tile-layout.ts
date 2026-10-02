/** Upper bound on tiles drawn, so a card never renders more than ~12. */
export const MAX_TILES = 12;
const DEFAULT_TILE_SIZE = 80;

/**
 * Pick the tile edge: the requested size, grown until the grid needs at most
 * MAX_TILES tiles. Exported for tests.
 */
export function resolveTileSize(width: number, height: number, requested = DEFAULT_TILE_SIZE) {
  let size = Math.max(requested, 8);
  while (Math.ceil(width / size) * Math.ceil(height / size) > MAX_TILES) {
    size = Math.ceil(size * 1.15);
  }
  return size;
}
