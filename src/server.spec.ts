import test from 'ava';
import { initServer } from './server';

test('server factory is defined', t => {
  t.not(initServer, undefined);
});

test('responds with status 200 for example route', async t => {
  const server = await initServer();
  const res = await server.inject({
    method: 'get',
    url: '/',
  });

  t.is(res.statusCode, 200);
});
