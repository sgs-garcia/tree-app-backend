import { Person } from './person';
import { Family } from './family';

export interface FirebaseTree {
  people: Record<string, Person>;
  families: Record<string, Family>;
}
