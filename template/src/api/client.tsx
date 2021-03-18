import axios from 'axios';

import {API_URL} from '@env';

export const client = axios.create({
  baseURL: API_URL,
});
