import Env from '@env';
import axios from 'axios';

export const client = axios.create({
  baseURL: Env.EXPO_PUBLIC_API_URL,
});
