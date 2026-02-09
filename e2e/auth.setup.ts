import { test as setup } from '@playwright/test'

setup('register test user', async ({ request }) => {
  await request.post('/api/auth/register', {
    data: {
      email: 'test@example.com',
      password: 'password123',
    },
  })
})
