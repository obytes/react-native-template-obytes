import axios from 'axios';

import { Env } from '@/core/env';
export const client = axios.create({
  baseURL: Env.API_URL,
});
