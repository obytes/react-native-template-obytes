import { useFonts } from 'expo-font';

//creating this hook to avoid having multiple fonts in root navigation
export const useFontsLoader = () => {
  const [fontsLoaded, fontError] = useFonts({
    Inter: require('assets/fonts/Inter.ttf'),
  });

  if (fontError) {
    console.error(fontError);
  }

  return { fontsLoaded };
};
