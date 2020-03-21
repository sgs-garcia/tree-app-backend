/* eslint-disable no-console */
import { startServer } from './server';

startServer().then(server => {
  console.log(`Server running on ${server.info.uri}`);
});

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});
