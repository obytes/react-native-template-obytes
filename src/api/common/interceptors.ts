import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { signIn, useAuth } from '@/core';

import { client } from './client';
import { toCamelCase, toSnakeCase } from './utils';

const ACCESS_TOKEN = 'access-token';
const CLIENT_HEADER = 'client';
const UID_HEADER = 'uid';
const EXPIRY_HEADER = 'expiry';
const AUTHORIZATION_HEADER = 'Authorization';

const CONTENT_TYPE = 'Content-Type';
const MULTIPART_FORM_DATA = 'multipart/form-data';

export default function interceptors() {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = useAuth.getState().token;

    const { headers, data } = config;

    if (headers && headers[CONTENT_TYPE] !== MULTIPART_FORM_DATA && data) {
      config.data = toSnakeCase(config.data);
    }

    if (token) {
      const { access, client: _client, uid, bearer, expiry } = token;

      config.headers[AUTHORIZATION_HEADER] = bearer;
      config.headers[ACCESS_TOKEN] = access;
      config.headers[CLIENT_HEADER] = _client;
      config.headers[UID_HEADER] = uid;
      config.headers[EXPIRY_HEADER] = expiry;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => {
      const { data, headers } = response;
      response.data = toCamelCase(response.data);

      const token = headers[ACCESS_TOKEN];
      const _client = headers[CLIENT_HEADER];
      const uid = headers[UID_HEADER];
      const expiry = headers[EXPIRY_HEADER];
      const bearer = headers[AUTHORIZATION_HEADER];

      if (token) {
        signIn({ access: token, client: _client, uid, expiry, bearer });
      }

      response.data = toCamelCase(data);

      return response;
    },
    (error: AxiosError) => Promise.reject(error),
  );
}
