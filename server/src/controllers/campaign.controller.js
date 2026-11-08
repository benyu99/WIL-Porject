import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { serializeCampaign } from '../utils/serialize.js';

const campaignInclude = {
  category: true,
  owner: { select: { id: true, name: true } },
};

const ensureCategoryExists = async (categoryId) => {
  if (categoryId == null) return;
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });
  if (!category) {
    throw ApiError.badRequest('INVALID_CATEGORY', 'The selected category does not exist.');
  }
};

const assertValidDateRange = (startDate, endDate) => {
  if (startDate && endDate && startDate > endDate) {
    throw ApiError.badRequest('INVALID_DATE_RANGE', 'endDate must be on or after startDate.');
  }
};

export const listCampaigns = asyncHandler(async (req, res) => {
  const { page, limit, categoryId, status } = req.validatedQuery;

  const where = {
    ...(categoryId !== undefined ? { categoryId } : {}),
    ...(status ? { status } : {}),
  };

  const [total, campaigns] = await prisma.$transaction([
    prisma.campaign.count({ where }),
    prisma.campaign.findMany({
      where,
      include: campaignInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  res.json({ items: campaigns.map(serializeCampaign), total, page, limit });
});

export const getCampaign = asyncHandler(async (req, res) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: req.validatedParams.id },
    include: campaignInclude,
  });

  if (!campaign) {
    throw ApiError.notFound('Campaign not found.');
  }

  res.json({ campaign: serializeCampaign(campaign) });
});

export const createCampaign = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    goalAmount,
    categoryId,
    status,
    startDate,
    endDate,
  } = req.body;

  await ensureCategoryExists(categoryId);
  assertValidDateRange(startDate, endDate);

  const campaign = await prisma.campaign.create({
    data: {
      title,
      description,
      goalAmount,
      categoryId,
      status,
      startDate,
      endDate,
      // The owner is always the authenticated user, never a client-provided id.
      ownerId: req.user.id,
    },
    include: campaignInclude,
  });

  res.status(201).json({ campaign: serializeCampaign(campaign) });
});

export const updateCampaign = asyncHandler(async (req, res) => {
  const { id } = req.validatedParams;
  const updates = req.body;

  const existing = await prisma.campaign.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound('Campaign not found.');
  }
  if (existing.ownerId !== req.user.id) {
    throw ApiError.forbidden('Only the campaign owner can update this campaign.');
  }

  if (updates.categoryId !== undefined) {
    await ensureCategoryExists(updates.categoryId);
  }

  // Validate the effective date range after merging the patch into the row.
  const startDate = updates.startDate !== undefined ? updates.startDate : existing.startDate;
  const endDate = updates.endDate !== undefined ? updates.endDate : existing.endDate;
  assertValidDateRange(startDate, endDate);

  const campaign = await prisma.campaign.update({
    where: { id },
    data: updates,
    include: campaignInclude,
  });

  res.json({ campaign: serializeCampaign(campaign) });
});

export const deleteCampaign = asyncHandler(async (req, res) => {
  const { id } = req.validatedParams;

  const existing = await prisma.campaign.findUnique({
    where: { id },
    select: { ownerId: true },
  });
  if (!existing) {
    throw ApiError.notFound('Campaign not found.');
  }
  if (existing.ownerId !== req.user.id) {
    throw ApiError.forbidden('Only the campaign owner can delete this campaign.');
  }

  await prisma.campaign.delete({ where: { id } });
  res.status(204).end();
});
