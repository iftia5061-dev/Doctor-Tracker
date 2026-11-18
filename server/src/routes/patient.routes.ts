import { Router } from 'express';
import {
  listPatients,
  getPatient,
  updatePatient,
  deletePatient,
  getPatientFilterOptions,
} from '../controllers/patient.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  updatePatientSchema,
  listPatientsSchema,
} from '../validators/patient.validator.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

// All patient routes require auth + admin role
router.use(authMiddleware, authorize('admin'));

router.get('/', validate(listPatientsSchema), listPatients);
router.get('/filters/options', getPatientFilterOptions);
router.get('/:id', getPatient);
router.patch('/:id', validate(updatePatientSchema), updatePatient);
router.delete('/:id', deletePatient);

export default router;
