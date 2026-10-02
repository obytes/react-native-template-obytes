import type { TileSpec } from './tile-data';
import * as React from 'react';

import Svg from 'react-native-svg';
import { TILE_UNITS } from './tile-data';
import { TileShapes } from './tiles';

export type PatternTileProps = {
  spec: TileSpec;
  /** Rendered edge length in points. Defaults to 200 (the tile's native size). */
  size?: number;
};

/** A single square pattern tile, scalable. */
export function PatternTile({ spec, size = TILE_UNITS }: PatternTileProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${TILE_UNITS} ${TILE_UNITS}`}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <TileShapes spec={spec} />
    </Svg>
  );
}
