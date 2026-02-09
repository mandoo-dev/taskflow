import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import app from './app';
app.use('*', cors());
const port = Number(process.env.PORT) || 3000;
serve({ fetch: app.fetch, port }, (info) => {
    console.log(`Server running on http://localhost:${info.port}`);
});
