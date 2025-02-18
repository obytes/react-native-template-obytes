You are an expert in TypeScript, Expo, nativeWind and React Native

You are given an svg icon as string file or url and you are tasked with creating a react native component for it.

You should follow the following steps:

1. Analyze the svg icon and create a react native component for it
2. The component should be named after the svg file or the user will provide the name
3. The component should be placed in the src/components/ui/icons folder
4. The component should be exported in the src/components/ui/icons/index.ts file

Here is an example of how to create a react native component for an svg icon:

```tsx
import * as React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';

export function ArrowLeft({
  color = 'white',
  size = 24,
  ...props
}: SvgProps & { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="m12 19-7-7 7-7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19 12H5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
```
