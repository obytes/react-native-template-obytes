import * as React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

export const Settings = (props: SvgProps) => {
  return (
    <Svg width={29} height={29} fill="none" {...props}>
      <Path
        d="M14.599 17.2a3 3 0 100-6 3 3 0 000 6z"
        stroke="#C3C3C3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21.999 17.2a1.65 1.65 0 00.33 1.82l.06.06a2.002 2.002 0 01-2.181 3.265 2 2 0 01-.65-.434l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51v.17a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1h-.17a2 2 0 110-4h.09a1.649 1.649 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h.08a1.65 1.65 0 001-1.51V5.2a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 013.265.649 2 2 0 01-.434 2.18l-.06.06a1.65 1.65 0 00-.33 1.82v.08a1.649 1.649 0 001.51 1h.17a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke="#C3C3C3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
