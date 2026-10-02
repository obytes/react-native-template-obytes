import * as React from 'react';

import colors from '@/components/ui/colors';
import { cleanup, render, screen } from '@/lib/test-utils';

import * as icons from './index';

afterEach(cleanup);

const names = Object.keys(icons).filter(k => k.endsWith('V2')) as (keyof typeof icons)[];

describe('v2 icons', () => {
  it('exports the expected set', () => {
    expect(names.sort()).toEqual(
      ['BellV2', 'CalendarV2', 'CaretRightV2', 'ChatV2', 'HomeV2', 'HorseshoeV2', 'PencilV2', 'PlayV2', 'StarV2', 'WalletV2'],
    );
  });

  it.each(names)('%s renders with color and size', (name) => {
    const Icon = icons[name] as React.ComponentType<any>;
    render(<Icon testID="icon" color={colors.plum} size={32} strokeWidth={2} />);
    expect(screen.getByTestId('icon')).toBeOnTheScreen();
  });
});
