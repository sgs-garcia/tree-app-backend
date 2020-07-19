import { Gender } from '../types';

export interface Person {
  id: string;
  shortName?: string;
  givenNames: string[];
  surnames: string[];
  birthDate: Date;
  isDeceased?: boolean;
  deceasedDate?: Date;
  gender: Gender;
  families: Relationships;
  parents: Relationships;
  partners: Relationships;
  children: Relationships;
  siblings: Relationships;
}

export interface Relationships {
  [id: string]: boolean;
}
