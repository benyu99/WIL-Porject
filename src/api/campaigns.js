import { request } from './client.js';

// GET /api/campaigns -> { items, total, page, limit }
export function listCampaigns({ page = 1, limit = 10, categoryId, status } = {}) {
  return request('/api/campaigns', { query: { page, limit, categoryId, status } });
}

export async function getCampaign(id) {
  const data = await request(`/api/campaigns/${encodeURIComponent(id)}`);
  return data.campaign;
}

export async function createCampaign(campaign) {
  const data = await request('/api/campaigns', { method: 'POST', body: campaign, auth: true });
  return data.campaign;
}

export async function updateCampaign(id, changes) {
  const data = await request(`/api/campaigns/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: changes,
    auth: true,
  });
  return data.campaign;
}

export function deleteCampaign(id) {
  return request(`/api/campaigns/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true });
}

export async function listCategories() {
  const data = await request('/api/categories');
  return data.categories;
}
