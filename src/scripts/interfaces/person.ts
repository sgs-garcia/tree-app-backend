import { Gender } from '../types';
import { Relationships } from './relationships';

export interface Person {
  id: string;
  shortName?: string;
  givenNames: string[];
  surnames: string[];
  birthDate?: string;
  isDeceased?: boolean;
  deceasedDate?: string;
  gender: Gender;
  families: Relationships;
  parents?: Relationships;
  partners?: Relationships;
  children?: Relationships;
  siblings?: Relationships;
}
