import { Relationships } from './relationships';

export interface Family {
  id: string;
  name: string;
  members: Relationships;
}
