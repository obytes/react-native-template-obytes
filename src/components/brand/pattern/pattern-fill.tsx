import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import type { TileSpec } from './tile-data';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import Svg, { G } from 'react-native-svg';
import { TILE_UNITS } from './tile-data';
import { resolveTileSize } from './tile-layout';
import { TileShapes } from './tiles';

const styles = StyleSheet.create({ root: { overflow: 'hidden' } });

export type PatternFillProps = {
  spec: TileSpec;
  style?: StyleProp<ViewStyle>;
  /** Preferred tile edge in points; grown if needed to stay within MAX_TILES. */
  tileSize?: number;
  borderRadius?: number;
  testID?: string;
};

/**
 * Fills its box by repeating a tile on a grid from the top-left, clipped to
 * the box (and its radius). Static and memoised: it does not re-render while
 * a parent scrolls.
 */
function PatternFillImpl({ spec, style, tileSize, borderRadius = 0, testID }: PatternFillProps) {
  const [box, setBox] = React.useState({ width: 0, height: 0 });

  const onLayout = React.useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox(prev => (prev.width === width && prev.height === height ? prev : { width, height }));
  }, []);

  const tiles = React.useMemo(() => {
    if (box.width <= 0 || box.height <= 0)
      return null;
    const size = resolveTileSize(box.width, box.height, tileSize);
    const scale = size / TILE_UNITS;
    const out: React.ReactNode[] = [];
    for (let row = 0; row * size < box.height; row++) {
      for (let col = 0; col * size < box.width; col++) {
        out.push(
          <G key={`${row}:${col}`} transform={`translate(${col * size} ${row * size}) scale(${scale})`}>
            <TileShapes spec={spec} />
          </G>,
        );
      }
    }
    return out;
  }, [box.width, box.height, tileSize, spec]);

  return (
    <View
      testID={testID}
      onLayout={onLayout}
      style={[styles.root, { borderRadius }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      {tiles && (
        <Svg width={box.width} height={box.height} style={StyleSheet.absoluteFill}>
          {tiles}
        </Svg>
      )}
    </View>
  );
}

export const PatternFill = React.memo(PatternFillImpl);
