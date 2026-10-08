import type {
  GetNextPageParamFunction,
  GetPreviousPageParamFunction,
} from '@tanstack/react-query';

export type PaginateQuery<T> = {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
};

type KeyParams = {
  [key: string]: any;
};
export const DEFAULT_LIMIT = 10;

export function getQueryKey<T extends KeyParams>(key: string, params?: T) {
  return [key, ...(params ? [params] : [])];
}

// for infinite query pages  to flatList data
export function normalizePages<T>(pages?: PaginateQuery<T>[]): T[] {
  return pages
    ? pages.reduce((prev: T[], current) => [...prev, ...current.results], [])
    : [];
}

const URL_PARAMS_REGEX = /[?&]([^=#]+)=([^&#]*)/g;

// a function that accept a url and return params as an object
export function getUrlParameters(
  url: string | null,
): Record<string, string> | null {
  if (url === null) {
    return null;
  }
  const params: Record<string, string> = {};
  // matchAll works on a copy of the regex, so the shared global regex keeps no state between calls
  for (const [, key, value] of url.matchAll(URL_PARAMS_REGEX)) {
    params[key] = value;
  }
  return params;
}

export const getPreviousPageParam: GetNextPageParamFunction<
  unknown,
  PaginateQuery<unknown>
> = page => getUrlParameters(page.previous)?.offset ?? null;

export const getNextPageParam: GetPreviousPageParamFunction<
  unknown,
  PaginateQuery<unknown>
> = page => getUrlParameters(page.next)?.offset ?? null;
