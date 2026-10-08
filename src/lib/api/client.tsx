import type { AxiosRequestConfig } from 'axios';
import Env from '@env';
import axios from 'axios';
import { Platform } from 'react-native';
import { fetch as nitroFetch } from 'react-native-nitro-fetch';

// Release builds on iOS and Android send requests through react-native-nitro-fetch,
// a native HTTP stack (URLSession on iOS, Cronet on Android) with HTTP/2, HTTP/3 and
// disk caching. Dev builds keep axios' default XHR adapter, because network inspectors
// such as React Native DevTools only see XHR traffic. Web uses the browser stack.
// Set this to `true` temporarily to test the native stack in a dev build.
const USE_NITRO_FETCH = !__DEV__ && Platform.OS !== 'web';

const nitroFetchConfig = {
  adapter: 'fetch',
  env: {
    fetch: nitroFetch,
    // `null` makes axios pass the url and options straight to Nitro's native client
    // instead of wrapping them in JS Request/Response objects.
    Request: null,
    Response: null,
  },
} as unknown as AxiosRequestConfig;

export const client = axios.create({
  baseURL: Env.EXPO_PUBLIC_API_URL,
  ...(USE_NITRO_FETCH ? nitroFetchConfig : {}),
});
