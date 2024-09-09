import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { client } from './client';
import { toCamelCase, toSnakeCase } from './utils';

export default function interceptors() {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (config.data) {
      config.data = toSnakeCase(config.data);
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      response.data = toCamelCase(response.data);
      return response;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );
}
