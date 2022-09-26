import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { ErrorFallback } from './error-fallback';

const myErrorHandler = (error: Error) => {
  console.log(error);
  //   captureException(error);
};

export const ErrorHandler = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback} onError={myErrorHandler}>
    {children}
  </ErrorBoundary>
);
