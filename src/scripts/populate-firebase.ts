/* eslint-disable no-console */
import { promisify } from 'util';
import { readFile } from 'fs';
import { v5 as uuid } from 'uuid';
import parse from 'csv-parse';
import { Person, Relationships } from './interfaces/person';
import { CsvPerson } from './interfaces/csvPerson';
import { Gender } from './types';
import { isEqual, uniqWith } from 'lodash';

interface Family {
  id: string;
  name: string;
  members: Relationships;
}

interface FirebaseTree {
  people: {
    [id: string]: Person;
  };
  families: {
    [id: string]: Family;
  };
}

interface IPersonMap {
  person: Person;
  rawPerson: CsvPerson;
}

const UUID_NAMESPACE = '2dcddfa0-9e59-45f6-bddc-d3031d7e121d';

main().catch(error => {
  console.error('There was an unexpected error!', error);
  process.exit(1);
});

async function main() {
  const [path] = process.argv.slice(2);
  const [familyName] = path.split('.');

  if (!path || !familyName) {
    console.error('Usage: npx ts-node populate-firebase.ts family-name.csv');
    process.exit(1);
  }

  const csv = await promisify(readFile)(path);
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

  const firebaseTree = buildFirebaseTree(family, people);
  console.log(firebaseTree.people);
  console.log(firebaseTree.families);
}

function buildFirebaseTree(family: Family, people: Map<string, Person>) {
  const firebaseTree: FirebaseTree = {
    people: {},
    families: { [family.id]: family },
  };
  for (const [personId, person] of people) {
    firebaseTree.people[personId] = person;
  }
  return firebaseTree;
}

async function processFile(parser: parse.Parser) {
  const rawPeople = new Map<number, IPersonMap>();

  for await (const rawPerson of parser) {
    const person = processLine(rawPerson);

    rawPeople.set(rawPerson.code, { person, rawPerson });
  }
  return rawPeople;
}

function processLine(rawPerson: CsvPerson): Person {
  const person: Person = {
    id: uuid(
      JSON.stringify({
        name: rawPerson.name,
        birth: rawPerson.birth,
        death: rawPerson,
      }),
      UUID_NAMESPACE
    ),
    ...splitName(rawPerson.name),
    birthDate: new Date(rawPerson.birth.setUTCHours(0, 0, 0, 0)),
    isDeceased: !!rawPerson.death,
    gender: mapGender(rawPerson.gender),
    families: {},
    parents: {},
    partners: {},
    children: {},
    siblings: {},
  };

  if (typeof rawPerson.death !== 'string') {
    person.deceasedDate = new Date(rawPerson.death.setUTCHours(0, 0, 0, 0));
  }

  const now = new Date();
  if (
    person.birthDate > now ||
    (person.deceasedDate && person.deceasedDate > now)
  ) {
    console.error('Incorrect dates for element!', person);
    process.exit(1);
  }

  return person;
}

function mapGender(gender: string) {
  switch (gender) {
    case 'Masculino':
      return Gender.MALE;
    case 'Femenino':
      return Gender.FEMALE;
    default:
      return Gender.OTHER;
  }
}

function splitName(name: string): Pick<Person, 'givenNames' | 'surnames'> {
  const givenNames = name.split(' ').filter(Boolean).map(capitalize);
  const surnames = givenNames.splice(-2);
  return { givenNames, surnames };
}

function capitalize(str: string) {
  if (!str) {
    return '';
  }

  const [firstLetter, ...restOfName] = [...str];
  const name =
    firstLetter.toUpperCase() + restOfName?.join('')?.toLowerCase() || '';
  const nonNames = ['Del', 'De', 'La', 'Y'];

  return nonNames.includes(name) ? name.toLowerCase() : name;
}

function isPersonMap(maybePerson: unknown): maybePerson is IPersonMap {
  return maybePerson !== undefined;
}

function setParentsAndPartners(rawPeople: Map<number, IPersonMap>) {
  rawPeople.forEach(({ person, rawPerson }) => {
    const mother = rawPeople.get(rawPerson?.M)?.person;
    const father = rawPeople.get(rawPerson?.P)?.person;
    const partnerIds = [
      rawPeople.get(rawPerson?.Par),
      rawPeople.get(rawPerson?.Par2),
    ]
      .filter(isPersonMap)
      .reduce((obj, { person: { id } }) => ({ ...obj, [id]: true }), {});

    if (mother) person.parents[mother.id] = true;
    if (father) person.parents[father.id] = true;
    person.partners = partnerIds;
  });
}

function addChildren(people: Map<string, Person>) {
  people.forEach((person, id) => {
    Object.entries(person.parents).forEach(([parentId, value]) => {
      const parent = people.get(parentId);
      if (parent) parent.children[id] = value;
    });
  });
}

function addSiblings(people: Map<string, Person>) {
  const duplicatedChildren = [...people.values()]
    .map(({ children }) => children)
    .filter(children => !!Object.entries(children).length);
  const siblingsGroups = uniqWith(duplicatedChildren, isEqual);

  siblingsGroups.forEach(siblings => {
    Object.keys(siblings).forEach(personId => {
      const person = people.get(personId);
      if (person) {
        person.siblings = { ...siblings };
        delete person.siblings[personId]; /** You are not your own sibling */
      }
    });
  });
}

function addFamily(name: string, people: Map<string, Person>): Family {
  const members: Relationships = {};
  const id = uuid(name, UUID_NAMESPACE);

  people.forEach((person, personId) => {
    person.families[id] = true;
    members[personId] = true;
  });

  return { id, name, members };
}
