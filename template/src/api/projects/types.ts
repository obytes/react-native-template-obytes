import type { CharityProject } from '../charities';

export interface CharityTag {
  id: number;
  title: string;
  projects: CharityProject[];
}
