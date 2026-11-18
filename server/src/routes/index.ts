import { Router } from 'express';
import authRoutes from './auth.routes.js';
import doctorRoutes from './doctor.routes.js';
import patientRoutes from './patient.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/doctors', doctorRoutes);
router.use('/patients', patientRoutes);
router.use('/dashboard', dashboardRoutes);

router.get('/', (req, res) => {
  res.json({
    message: 'Doctor Tracker API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      doctors: '/api/v1/doctors',
      patients: '/api/v1/patients',
      dashboard: '/api/v1/dashboard',
    },
  });
});

export default router;
