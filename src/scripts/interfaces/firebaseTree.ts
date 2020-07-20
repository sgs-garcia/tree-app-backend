import { Person } from './person';
import { Family } from './family';

export interface FirebaseTree {
  people: {
    [id: string]: Person;
  };
  families: {
    [id: string]: Family;
  };
}
