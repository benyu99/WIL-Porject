import { z } from 'zod';

export const CAMPAIGN_STATUSES = ['draft', 'active', 'completed'];

const toNullIfEmpty = (value) => (value === '' ? null : value);

const descriptionField = z.preprocess(
  toNullIfEmpty,
  z.string().max(5000, 'Description must be at most 5000 characters.').nullable().optional(),
);

const goalAmountField = z.preprocess(
  toNullIfEmpty,
  z.coerce
    .number()
    .positive('Goal amount must be greater than 0.')
    .max(999_999_999_999, 'Goal amount is too large.')
    .nullable()
    .optional(),
);

const categoryIdField = z.preprocess(
  toNullIfEmpty,
  z.coerce.number().int('Category id must be an integer.').positive().nullable().optional(),
);

const statusField = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.enum(CAMPAIGN_STATUSES, {
    errorMap: () => ({ message: `Status must be one of: ${CAMPAIGN_STATUSES.join(', ')}.` }),
  }).optional(),
);

const dateField = z.preprocess(
  toNullIfEmpty,
  z.coerce.date({ invalid_type_error: 'Date must be a valid ISO date.' }).nullable().optional(),
);

export const createCampaignSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required.')
    .max(200, 'Title must be at most 200 characters.'),
  description: descriptionField,
  goalAmount: goalAmountField,
  categoryId: categoryIdField,
  status: statusField.default('draft'),
  startDate: dateField,
  endDate: dateField,
});

export const updateCampaignSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required.')
      .max(200, 'Title must be at most 200 characters.')
      .optional(),
    description: descriptionField,
    goalAmount: goalAmountField,
    categoryId: categoryIdField,
    status: statusField,
    startDate: dateField,
    endDate: dateField,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided.',
  });

const toUndefinedIfEmpty = (value) => (value === '' || value === undefined ? undefined : value);

export const listCampaignsQuerySchema = z.object({
  page: z.preprocess(toUndefinedIfEmpty, z.coerce.number().int().min(1).default(1)),
  limit: z.preprocess(
    toUndefinedIfEmpty,
    z.coerce.number().int().min(1).max(50).default(10),
  ),
  categoryId: z.preprocess(
    toUndefinedIfEmpty,
    z.coerce.number().int().positive().optional(),
  ),
  status: z.preprocess(toUndefinedIfEmpty, z.enum(CAMPAIGN_STATUSES).optional()),
});

export const campaignIdParamsSchema = z.object({
  id: z.string().uuid('Campaign id must be a valid UUID.'),
});
