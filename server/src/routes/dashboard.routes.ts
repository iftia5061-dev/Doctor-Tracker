import { Router } from 'express';
import {
  getSummary,
  getPatientsPerDoctor,
  getTimeline,
  getConditions,
  getSpecializations,
} from '../controllers/dashboard.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

// All dashboard routes require auth + admin role
router.use(authMiddleware, authorize('admin'));

router.get('/summary', getSummary);
router.get('/patients-per-doctor', getPatientsPerDoctor);
router.get('/timeline', getTimeline);
router.get('/conditions', getConditions);
router.get('/specializations', getSpecializations);

export default router;
