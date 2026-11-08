const toDateOnly = (value) => (value ? value.toISOString().slice(0, 10) : null);

export const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt.toISOString(),
});

export const serializeCategory = (category) => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
});

export const serializeCampaign = (campaign) => ({
  id: campaign.id,
  ownerId: campaign.ownerId,
  title: campaign.title,
  description: campaign.description ?? null,
  goalAmount: campaign.goalAmount == null ? null : Number(campaign.goalAmount),
  status: campaign.status,
  startDate: toDateOnly(campaign.startDate),
  endDate: toDateOnly(campaign.endDate),
  category: campaign.category ? serializeCategory(campaign.category) : null,
  owner: campaign.owner ? { id: campaign.owner.id, name: campaign.owner.name } : undefined,
  createdAt: campaign.createdAt.toISOString(),
  updatedAt: campaign.updatedAt.toISOString(),
});
