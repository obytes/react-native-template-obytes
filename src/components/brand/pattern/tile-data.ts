export const COLOURWAYS = {
  // `spur`: the harlequin tile's stars (the sheet draws them in `mid`).
  plum: { base: '#3A243C', mid: '#57385A', accent: '#CCA1D0', light: '#F2D6F4', spur: '#57385A' },
  navy: { base: '#172741', mid: '#374B6C', accent: '#B9D8E1', light: '#DAEDF3', spur: '#374B6C' },
  navyLit: {
    base: '#172741',
    mid: '#374B6C',
    accent: '#EEEADF',
    light: '#DAEDF3',
    spur: '#B9D8E1',
  },
  green: {
    base: '#043F29',
    mid: '#A6B999',
    accent: '#EEEADF',
    light: '#D4DCCE',
    spur: '#A6B999',
  },
  cream: {
    base: '#EEEADF',
    mid: '#FFFFFF',
    accent: '#CCA1D0',
    light: '#FFFFFF',
    spur: '#FFFFFF',
  },
} as const;

export type Colourway = keyof typeof COLOURWAYS;
export type TileKind = 'quad' | 'gem' | 'ring' | 'harlequin';

export type TileSpec = {
  kind: TileKind;
  colourway: Colourway;
  /** Quarter turns (the ring tile is symmetric, so 0 for the quilt). */
  turn: 0 | 1 | 2 | 3;
};

/** Tile edge in SVG units. */
export const TILE_UNITS = 200;

/** The one pattern the waitlist quilt repeats: navy diamonds and spurs (harlequin). */
export const QUILT_TILE: TileSpec = { kind: 'harlequin', colourway: 'navy', turn: 0 };

/** Everyone through the gate: the same tile, its spurs lit ice blue. */
export const CELEBRATION_TILE: TileSpec = { kind: 'harlequin', colourway: 'navyLit', turn: 0 };
