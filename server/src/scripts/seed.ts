import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { User } from '../models/user.model.js';
import { Doctor } from '../models/doctor.model.js';
import { Patient } from '../models/patient.model.js';

const specializations = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Dermatology',
  'Oncology',
  'Gastroenterology',
  'Pulmonology',
  'Nephrology',
  'Endocrinology',
];

const hospitals = [
  'City Hospital',
  'Medical Center',
  'General Hospital',
  'Specialty Clinic',
  'Health Care Center',
];

const conditions = [
  'Diabetes',
  'Hypertension',
  'Asthma',
  'Fracture',
  'Fever',
  'Cardiac',
  'Migraine',
  'Arthritis',
  'Pneumonia',
  'Kidney Disease',
];

const generateRandomDate = (start: Date, end: Date): Date => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

const seed = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
    const admin = await User.create({
      name: 'Admin',
      email: env.ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    });
    console.log('✅ Admin user created');

    // Create doctors
    const doctors = [];
    for (let i = 0; i < 30; i++) {
      const doctor = await Doctor.create({
        name: `Doctor ${i + 1}`,
        specialization:
          specializations[Math.floor(Math.random() * specializations.length)],
        hospital: hospitals[Math.floor(Math.random() * hospitals.length)],
        phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        email: `doctor${i + 1}@hospital.com`,
      });
      doctors.push(doctor);
    }
    console.log(`✅ Created ${doctors.length} doctors`);

    // Create patients
    const patients = [];
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    for (let i = 0; i < 500; i++) {
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const patient = await Patient.create({
        name: `Patient ${i + 1}`,
        age: Math.floor(Math.random() * 80) + 10,
        gender: ['male', 'female', 'other'][
          Math.floor(Math.random() * 3)
        ] as 'male' | 'female' | 'other',
        phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        email: `patient${i + 1}@example.com`,
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        notes: i % 5 === 0 ? 'Requires follow-up' : undefined,
        doctor: doctor._id,
        createdAt: generateRandomDate(oneYearAgo, new Date()),
      });
      patients.push(patient);
    }
    console.log(`✅ Created ${patients.length} patients`);

    console.log('\n🎉 Seed completed successfully!');
    console.log(`\n📧 Admin Email: ${env.ADMIN_EMAIL}`);
    console.log(`🔑 Admin Password: ${env.ADMIN_PASSWORD}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
