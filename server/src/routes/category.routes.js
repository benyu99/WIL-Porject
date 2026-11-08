import { Router } from 'express';
import { listCategories } from '../controllers/category.controller.js';

export const categoryRouter = Router();

categoryRouter.get('/', listCategories);
