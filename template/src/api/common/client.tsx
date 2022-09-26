import Config from '@config';
import axios from 'axios';
export const client = axios.create({
  baseURL: Config.API_URL,
});
