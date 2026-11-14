import { request, tokenStore } from './client.js';

export async function register({ name, email, password }) {
  const data = await request('/api/auth/register', {
    method: 'POST',
    body: { name, email, password },
  });
  tokenStore.set(data.token);
  return data.user;
}

export async function login({ email, password }) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  tokenStore.set(data.token);
  return data.user;
}

export async function getCurrentUser() {
  if (!tokenStore.get()) return null;
  const data = await request('/api/auth/me', { auth: true });
  return data.user;
}

export function logout() {
  tokenStore.clear();
}
