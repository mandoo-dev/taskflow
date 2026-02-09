import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import app from './app';

app.use('*', cors({
  origin: [
    'https://taskflow-3evlaly9j-mandoo-devs-projects.vercel.app',
    'http://localhost:5173',
  ],
}));

const port = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});
