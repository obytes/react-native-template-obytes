import Constants from 'expo-constants';

console.log('constants', Constants.expoConfig?.extra);
/**
 *  @type {typeof import('../env.js').ClientEnv}
 */
//@ts-ignore // we trust we are passing the correct evn vars to extra in app.config.ts
export const Env = Constants.expoConfig?.extra ?? {};
