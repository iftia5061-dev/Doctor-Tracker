import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPatient extends Document {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  condition: string;
  notes?: string;
  doctor: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age must be at least 0'],
      max: [120, 'Age must be at most 120'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
patientSchema.index({ doctor: 1, createdAt: -1 });
patientSchema.index({ condition: 1, createdAt: -1 });
patientSchema.index({ createdAt: -1 });
patientSchema.index({
  name: 'text',
  email: 'text',
  phone: 'text',
});

export const Patient = mongoose.model<IPatient>('Patient', patientSchema);
