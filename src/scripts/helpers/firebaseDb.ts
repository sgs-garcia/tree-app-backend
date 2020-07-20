/* eslint-disable no-console */
import admin from 'firebase-admin';
import { FirebaseTree } from '../interfaces';

export class FirebaseDb {
  private readonly app: admin.app.App;
  private readonly db: admin.database.Database;
  constructor(databaseURL: string, credentialsPath: string | undefined) {
    const appOptions: admin.AppOptions = { databaseURL };
    if (credentialsPath) {
      appOptions.credential = admin.credential.cert(credentialsPath);
    }

    this.app = admin.initializeApp(appOptions);
    this.db = admin.database(this.app);
  }

  async getTree(): Promise<FirebaseTree> {
    const snapshot = await this.db.ref().once('value');
    const tree = snapshot.val();

    console.log(!tree ? 'No tree was found in Firebase' : 'Got existing tree');
    return tree;
  }

  async setTree(tree: FirebaseTree) {
    return this.db.ref().set(tree);
  }

  closeConnection() {
    this.app.delete();
  }
}
