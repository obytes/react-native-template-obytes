// we only use this file to add typescript support to the config file
// unfortunately, we cant use typescript config inside expo config file
import Constants from 'expo-constants';

import { getConfig } from './config.js';

const NConfig = getConfig(
  Constants.expoConfig?.extra?.APP_ENV ?? 'development'
);

// TODO: check how we can use typescript for this
type APP_ENV_Type = 'development' | 'staging' | 'production';
type ConfigType = {
  scheme: string;
  icon: string;
  foregroundImage: string;
  APP_ENV: APP_ENV_Type;
  API_URL: string;
  version: string;
  name: string;
};
const Config = NConfig as ConfigType;

export default Config;
