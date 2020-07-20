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

  const firebaseTree = !currentTree
    ? processedTree
    : merge(currentTree, processedTree);
  console.log(firebaseTree.families, firebaseTree.people);

  return firebaseTree;
}
