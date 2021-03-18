import {useQuery} from 'react-query';
import {client} from './client';

type TaskType = {
  label: string;
  done: boolean;
  color: string;
};

const getTasks = async () => {
  const {data} = await client.get('/tasks');
  return data;
};

export function useTasks() {
  return useQuery<TaskType[]>('tasks', getTasks);
}
