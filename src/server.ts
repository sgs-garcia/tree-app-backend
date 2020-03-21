import { Server } from '@hapi/hapi';

const server = new Server({
  port: 3000,
  host: 'localhost',
});

server.route({
  method: 'GET',
  path: '/',
  handler: () => ({
    message: 'Hello World!',
  }),
});

export const initServer = async (): Promise<Server> => {
  await server.initialize();
  return server;
};

export const startServer = async (): Promise<Server> => {
  await server.start();
  return server;
};
