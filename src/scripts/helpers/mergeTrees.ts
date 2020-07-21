/* eslint-disable no-console */
import { FirebaseTree } from '../interfaces';
import { merge } from 'lodash';

export function mergeTrees(
  currentTree: FirebaseTree,
  processedTree: FirebaseTree
) {
  if (currentTree) {
    console.log('Merging current Firebase tree with processed one');
  }
  return !currentTree ? processedTree : merge(currentTree, processedTree);
}
