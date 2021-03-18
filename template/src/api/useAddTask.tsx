import {useMutation} from 'react-query';
import {client} from './client';

type TaskType = {
  label: string;
  done: boolean;
  color: string;
};

export function useAddTask() {
  return useMutation((data: TaskType) => client.post('/tasks', data));
}
