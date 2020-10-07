import * as React from 'react';
// import {captureException} from '@sentry/react-native';
import {ErrorBoundary} from 'react-error-boundary';
import {
  setJSExceptionHandler,
  setNativeExceptionHandler,
} from 'react-native-exception-handler';

import Toast from '../Toast';
import {ErrorFallback} from './ErrorFallback';

setJSExceptionHandler((error, isFatal) => {
  console.log(error, isFatal);
  Toast.show({
    text1: 'Something went wrong ',
    text2: 'we will fix it ASAP ',
    bottomOffset: 80,
    type: 'error',
    position: 'bottom',
  });
  //TODO: send reports to Sentry
  // create a toast
});

//For most use cases:
setNativeExceptionHandler((exceptionString) => {
  console.log({exceptionString});
  // This is your custom global error handler
  // You do stuff likehit google analytics to track crashes.
  // or hit a custom api to inform the dev team.
  //NOTE: alert or showing any UI change via JS
  //WILL NOT WORK in case of NATIVE ERRORS.
});

const myErrorHandler = (error: Error) => {
  console.log(error);
  //   captureException(error);
};

export const ErrorHandler = ({children}: {children: React.ReactNode}) => (
  <ErrorBoundary FallbackComponent={ErrorFallback} onError={myErrorHandler}>
    {children}
  </ErrorBoundary>
);
