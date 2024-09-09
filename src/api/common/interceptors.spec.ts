import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosError, AxiosHeaders } from 'axios';

import interceptors from '@/api/common/interceptors';

import { client } from './client';

const testRequestInterceptors = () => {
  describe('request interceptors', () => {
    describe('when the request has data', () => {
      const restConfig = {
        baseURL: 'http://localhost:3000',
        url: '/test',
        headers: new AxiosHeaders({
          'Content-Type': 'application/json',
        }),
      };

      const config: InternalAxiosRequestConfig = {
        data: {
          fooBar: 'foo',
          barBaz: 'bar',
        },
        ...restConfig,
      };

      let interceptedConfig: InternalAxiosRequestConfig;

      beforeEach(async () => {
        const { fulfilled } = client.interceptors.request.handlers[0];

        if (!fulfilled) {
          return;
        }

        interceptedConfig = await fulfilled(config);
      });

      it('should convert the data to snake_case', () => {
        expect(interceptedConfig.data).toEqual({
          foo_bar: 'foo',
          bar_baz: 'bar',
        });
      });

      it('should not modify the rest of the config', () => {
        expect(interceptedConfig).toMatchObject(config);
      });
    });

    describe('when the request has no data', () => {
      const config: InternalAxiosRequestConfig = {
        baseURL: 'http://localhost:3000',
        url: '/test',
        headers: new AxiosHeaders({
          'Content-Type': 'application/json',
        }),
      };

      let interceptedConfig: InternalAxiosRequestConfig;

      beforeEach(async () => {
        const { fulfilled } = client.interceptors.request.handlers[0];

        if (!fulfilled) {
          return;
        }

        interceptedConfig = await fulfilled(config);
      });

      it('should not modify the config', () => {
        expect(interceptedConfig).toEqual(config);
      });
    });
  });
};

const testResponseInterceptors = () => {
  describe('response interceptors', () => {
    describe('when the response is successful', () => {
      const response: AxiosResponse = {
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: new AxiosHeaders({}),
        },
        data: {
          foo_bar: 'foo',
          bar_baz: 'bar',
        },
      };

      let interceptedResponse: AxiosResponse;

      beforeEach(async () => {
        const { fulfilled } = client.interceptors.response.handlers[0];

        if (!fulfilled) {
          return;
        }

        interceptedResponse = await fulfilled(response);
      });

      it('camelizes the response data', async () => {
        expect(interceptedResponse.data).toEqual({
          fooBar: 'foo',
          barBaz: 'bar',
        });
      });
    });

    describe('when the response is an error', () => {
      const axiosError = new AxiosError('API error');

      it('throws the same error', async () => {
        const { rejected } = client.interceptors.response.handlers[0];

        if (!rejected) {
          return;
        }

        await expect(rejected(axiosError)).rejects.toEqual(axiosError);
      });
    });
  });
};

describe('interceptors', () => {
  beforeAll(() => {
    interceptors();
  });

  testRequestInterceptors();
  testResponseInterceptors();
});
