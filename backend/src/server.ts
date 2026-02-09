import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import app from './app';

app.use('*', cors());

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});
