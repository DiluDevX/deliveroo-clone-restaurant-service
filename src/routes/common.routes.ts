import { Router } from 'express';
import {
  fallback,
  healthCheck,
  readinessCheck,
  livenessCheck,
} from '../controllers/common.controller';

const router = Router();

router.get('/health', healthCheck);
router.get('/health/ready', readinessCheck);
router.get('/health/live', livenessCheck);

router.use(fallback);

export default router;
