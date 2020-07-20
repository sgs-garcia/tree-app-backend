import { Person, FirebaseTree } from '../interfaces';
import { readFileSync } from 'fs';
import parse from 'csv-parse';
import {
  setParentsAndPartners,
  addChildren,
  addSiblings,
  addFamily,
  IPersonMap,
  processPerson,
} from './peopleOperations';

export class FirebaseTreeFactory {
  static async fromFile(
    filePath: string,
    familyName: string
  ): Promise<FirebaseTree> {
    const csv = readFileSync(filePath);
    const parser = parse(csv, { cast: true, cast_date: true, columns: true });
    const rawPeople = await processFile(parser);

    setParentsAndPartners(rawPeople);

    const people = new Map<string, Person>(
      [...rawPeople.values()].map(({ person }) => [person.id, person])
    );
    rawPeople.clear();

    addChildren(people);
    addSiblings(people);
    const family = addFamily(familyName, people);

    return {
      families: { [family.id]: family },
      people: peopleTreeFromMap(people),
    };
  }
}

async function processFile(parser: parse.Parser) {
  const rawPeople = new Map<number, IPersonMap>();

  for await (const rawPerson of parser) {
    const person = processPerson(rawPerson);
    rawPeople.set(rawPerson.code, { person, rawPerson });
  }
  return rawPeople;
}

function peopleTreeFromMap(people: Map<string, Person>) {
  const peopleTree: Record<string, Person> = {};
  for (const [personId, person] of people) {
    peopleTree[personId] = person;
  }
  return peopleTree;
}
