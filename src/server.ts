import { Server } from '@hapi/hapi';

const server = new Server({
  port: process.env.PORT || 3000,
  host: '0.0.0.0',
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
