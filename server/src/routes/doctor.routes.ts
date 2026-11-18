import { Router } from 'express';
import {
  createDoctor,
  listDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
  addPatientToDoctor,
  removePatientFromDoctor,
  getDoctorFilterOptions,
} from '../controllers/doctor.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createDoctorSchema,
  updateDoctorSchema,
  getDoctorSchema,
  listDoctorsSchema,
} from '../validators/doctor.validator.js';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

// All doctor routes require auth + admin role
router.use(authMiddleware, authorize('admin'));

router.post('/', validate(createDoctorSchema), createDoctor);
router.get('/', validate(listDoctorsSchema), listDoctors);
router.get('/filters/options', getDoctorFilterOptions);
router.get('/:id', validate(getDoctorSchema), getDoctor);
router.patch('/:id', validate(updateDoctorSchema), updateDoctor);
router.delete('/:id', validate(getDoctorSchema), deleteDoctor);
router.get('/:id/patients', validate(getDoctorSchema), getDoctorPatients);
router.post('/:id/patients', validate(getDoctorSchema), addPatientToDoctor);
router.delete(
  '/:id/patients/:patientId',
  validate(getDoctorSchema),
  removePatientFromDoctor
);

export default router;
