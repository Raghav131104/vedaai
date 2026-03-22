import mongoose, { Schema, Document } from 'mongoose';

export interface ISchoolSettings extends Document {
  schoolName: string;
  schoolLocation: string;
  schoolLogo?: string;
  principalName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  boardAffiliation?: string;
  updatedAt: Date;
}

const SchoolSettingsSchema = new Schema<ISchoolSettings>(
  {
    schoolName: { type: String, required: true, default: 'Delhi Public School' },
    schoolLocation: { type: String, required: true, default: 'Bokaro Steel City' },
    schoolLogo: { type: String },
    principalName: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    address: { type: String },
    boardAffiliation: { type: String, default: 'CBSE' },
  },
  { timestamps: true }
);

export const SchoolSettings = mongoose.model<ISchoolSettings>('SchoolSettings', SchoolSettingsSchema);
