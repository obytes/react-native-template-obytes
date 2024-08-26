import type { InternalAxiosRequestConfig } from 'axios';

declare module 'axios' {
  // TODO: remove this when axios typings are updated
  // PR: https://github.com/axios/axios/pull/6138
  interface AxiosInterceptorManager<V> {
    handlers: Array<{
      fulfilled: ((value: V) => V | Promise<V>) | null;
      rejected: ((error: any) => any) | null;
      synchronous: boolean;
      runWhen: (config: InternalAxiosRequestConfig) => boolean | null;
    }>;
  }
}
