import { Router } from 'express';
import { csrfToken } from '../controllers/security.controller.js';

const router = Router();

router.get('/csrf-token', csrfToken);

export default router;
