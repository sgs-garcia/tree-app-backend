/* eslint-disable no-console */
import dotenv from 'dotenv';
import { FirebaseDb } from './helpers/firebaseDb';
import { mergeTrees } from './helpers/mergeTrees';
import { FirebaseTreeFactory } from './helpers/firebaseTreeFactory';
import { getUserConfirmation } from './helpers/getUserConfirmation';

main().catch(error => {
  console.error('There was an unexpected error!', error);
  process.exit(1);
});

async function main() {
  dotenv.config();
  const { GCP_SA_PATH, DATABASE_URL } = process.env;
  if (!DATABASE_URL) {
    console.error('DATABASE_URL is not set!');
    process.exit(1);
  }

  const [path] = process.argv.slice(2);
  if (!path) {
    console.error('Usage: npm run populate -- family-name.csv');
    process.exit(1);
  }
  const [familyName] = path.split('.');

  console.log('Getting current Firebase tree');
  const firebaseDb = new FirebaseDb(DATABASE_URL, GCP_SA_PATH);
  const currentTree = await firebaseDb.getTree();

  console.log('Processing file');
  const processedTree = await FirebaseTreeFactory.fromFile(path, familyName);
  const firebaseTree = mergeTrees(currentTree, processedTree);
  console.log(firebaseTree.families, firebaseTree.people);

  try {
    await getUserConfirmation('Write this tree to Firebase?');

    console.log('Writing processed tree to Firebase');
    firebaseDb.setTree(firebaseTree);
  } catch {
    console.log('Skipping tree overwrite');
  } finally {
    firebaseDb.closeConnection();
    console.log('Done!');
  }
}
