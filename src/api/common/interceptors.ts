import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { useAuth } from '@/core';

import { client } from './client';
import { toCamelCase, toSnakeCase } from './utils';

export default function interceptors() {
  const token = useAuth.getState().token;
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (config.data) {
      config.data = toSnakeCase(config.data);
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      response.data = toCamelCase(response.data);
      return response;
    },
    (error: AxiosError) => Promise.reject(error),
  );
}
