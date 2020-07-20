import { Gender } from '../types';

export function mapGender(gender: string) {
  switch (gender) {
    case 'Masculino':
      return Gender.MALE;
    case 'Femenino':
      return Gender.FEMALE;
    default:
      return Gender.OTHER;
  }
}
