import { Person } from '../interfaces';

export function splitName(
  name: string
): Pick<Person, 'givenNames' | 'surnames'> {
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
