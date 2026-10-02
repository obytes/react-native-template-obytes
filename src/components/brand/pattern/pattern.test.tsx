import type { TileKind } from './index';

import * as React from 'react';

import { act, cleanup, render, screen } from '@/lib/test-utils';
import { COLOURWAYS, MAX_TILES, PatternFill, PatternTile, resolveTileSize } from './index';

afterEach(cleanup);

const KINDS: TileKind[] = ['quad', 'gem', 'ring', 'harlequin'];

describe('pattern tiles', () => {
  it('defines the five colourways', () => {
    expect(Object.keys(COLOURWAYS)).toEqual(['plum', 'navy', 'navyLit', 'green', 'cream']);
  });

  it.each(KINDS)('renders a %s tile for every turn', (kind) => {
    for (const turn of [0, 1, 2, 3] as const) {
      const { unmount } = render(<PatternTile spec={{ kind, colourway: 'plum', turn }} size={64} />);
      unmount();
    }
  });

  it('caps the tile count for any box', () => {
    for (const [w, h] of [[358, 180], [1000, 1000], [20, 20], [390, 844]]) {
      const size = resolveTileSize(w, h);
      expect(Math.ceil(w / size) * Math.ceil(h / size)).toBeLessThanOrEqual(MAX_TILES);
    }
  });

  it('renders PatternFill after layout', () => {
    render(
      <PatternFill
        testID="fill"
        spec={{ kind: 'harlequin', colourway: 'plum', turn: 0 }}
        borderRadius={8}
      />,
    );
    const opts = { includeHiddenElements: true };
    const view = screen.getByTestId('fill', opts);
    act(() => {
      view.props.onLayout({ nativeEvent: { layout: { width: 320, height: 160, x: 0, y: 0 } } });
    });
    expect(screen.getByTestId('fill', opts).props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderRadius: 8 })]),
    );
    // 320x160 at 80pt => 4x2 = 8 tiles, each with one rotation group
    const groups = screen.UNSAFE_root.findAll((n: { props: { transform?: string } }) => n.props.transform === 'rotate(0 100 100)');
    expect(groups.length).toBeGreaterThanOrEqual(8);
  });
});
