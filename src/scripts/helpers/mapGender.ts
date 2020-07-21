import { Gender } from '../types';

export function mapGender(gender: string) {
  switch (gender.toLowerCase()) {
    case 'masculino':
      return Gender.MALE;
    case 'femenino':
      return Gender.FEMALE;
    default:
      return Gender.OTHER;
  }
}
