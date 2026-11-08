import { Router } from 'express';
import {
  createCampaign,
  deleteCampaign,
  getCampaign,
  listCampaigns,
  updateCampaign,
} from '../controllers/campaign.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  campaignIdParamsSchema,
  createCampaignSchema,
  listCampaignsQuerySchema,
  updateCampaignSchema,
} from '../validators/campaign.validator.js';

export const campaignRouter = Router();

// Public reads.
campaignRouter.get('/', validate({ query: listCampaignsQuerySchema }), listCampaigns);
campaignRouter.get('/:id', validate({ params: campaignIdParamsSchema }), getCampaign);

// Authenticated writes.
campaignRouter.post('/', requireAuth, validate({ body: createCampaignSchema }), createCampaign);
campaignRouter.patch(
  '/:id',
  requireAuth,
  validate({ params: campaignIdParamsSchema, body: updateCampaignSchema }),
  updateCampaign,
);
campaignRouter.delete(
  '/:id',
  requireAuth,
  validate({ params: campaignIdParamsSchema }),
  deleteCampaign,
);
