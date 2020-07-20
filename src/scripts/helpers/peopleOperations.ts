/* eslint-disable no-console */
import { Person, Family, Relationships, CsvPerson } from '../interfaces';
import { v5 as uuid } from 'uuid';
import { splitName } from './splitName';
import { mapGender } from './mapGender';
import { uniqWith, isEqual } from 'lodash';

export interface IPersonMap {
  person: Person;
  rawPerson: CsvPerson;
}

export const UUID_NAMESPACE = '2dcddfa0-9e59-45f6-bddc-d3031d7e121d';

export function processPerson(rawPerson: CsvPerson): Person {
  const names = splitName(rawPerson.name);
  const idString = JSON.stringify({
    ...names,
    birth: rawPerson.birth
      ? new Date(rawPerson.birth.setUTCHours(0, 0, 0, 0))
      : undefined,
  });
  console.log(`Processing ${idString}`);

  const person: Person = {
    id: uuid(idString, UUID_NAMESPACE),
    ...names,
    isDeceased: !!rawPerson.death,
    gender: mapGender(rawPerson.gender),
    families: {},
    parents: {},
    partners: {},
    children: {},
    siblings: {},
  };

  if (rawPerson.birth) {
    person.birthDate = new Date(
      rawPerson.birth.setUTCHours(0, 0, 0, 0)
    ).toISOString();
  }
  if (typeof rawPerson.death !== 'string') {
    person.deceasedDate = new Date(
      rawPerson.death.setUTCHours(0, 0, 0, 0)
    ).toISOString();
  }
  const now = Date.now();
  if (
    (person.birthDate && Date.parse(person.birthDate) > now) ||
    (person.deceasedDate && Date.parse(person.deceasedDate) > now)
  ) {
    console.error('Incorrect dates for element!', person);
    process.exit(1);
  }

  return person;
}

export function setParentsAndPartners(rawPeople: Map<number, IPersonMap>) {
  rawPeople.forEach(({ person, rawPerson }) => {
    const mother = rawPeople.get(rawPerson?.M)?.person;
    const father = rawPeople.get(rawPerson?.P)?.person;
    const partnerIds = [
      rawPeople.get(rawPerson?.Par),
      rawPeople.get(rawPerson?.Par2),
    ]
      .filter((p: unknown): p is IPersonMap => p !== undefined)
      .reduce((obj, { person: { id } }) => ({ ...obj, [id]: true }), {});

    if (!person.parents) person.parents = {};
    if (mother) person.parents[mother.id] = true;
    if (father) person.parents[father.id] = true;
    person.partners = partnerIds;
  });
}

export function addChildren(people: Map<string, Person>) {
  people.forEach((person, id) => {
    Object.entries(person.parents).forEach(([parentId, value]) => {
      const parent = people.get(parentId);

      if (!person.children) person.children = {};
      if (parent) parent.children[id] = value;
    });
  });
}

export function addSiblings(people: Map<string, Person>) {
  const duplicatedChildren = [...people.values()]
    .map(({ children }) => children || {})
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

export function addFamily(name: string, people: Map<string, Person>): Family {
  const members: Relationships = {};
  const id = uuid(name, UUID_NAMESPACE);

  people.forEach((person, personId) => {
    person.families[id] = true;
    members[personId] = true;
  });

  return { id, name, members };
}
