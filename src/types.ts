/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Patient {
  name: string;
  age: string;
  gender: string; // 'მამრობითი' | 'მდედრობითი' | 'სხვა'
  phone: string;
  email: string;
  visitDate: string;
  notes: string;
}

export interface MedicalRecord {
  id: string;
  patient: Patient;
  doctor?: {
    name: string;
    phone: string;
    email: string;
    emailJsServiceId?: string;
  };
  complaints: string;
  anamnesis: string;
  diagnosis: string;
  prescription: string; // Containing formatted HTML
  doctorNotes: string;
  createdAt: string;
  updatedAt: string;
}

export type TemplateCategory = 'ზოგადი დანიშნულება' | 'კვლევები' | 'მედიკამენტები' | 'რეკომენდაციები' | 'კონტროლი / განმეორებითი ვიზიტი';

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  content: string; // Containing HTML formatted text
}

export interface AppSettings {
  doctorName: string;
  doctorPhone: string;
  doctorEmail: string;
  doctorPasswordHash: string; // SHA-256 or simple text for simplicity, defaults to 'giorgi591' or 'giorgi777'
  emailJsServiceId: string;
  emailJsTemplateId: string;
  emailJsPublicKey: string;
  emailJsFromName: string;
}

export interface ClinicalUser {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  emailJsServiceId?: string;
  username: string;
  password: string;
  role: 'admin' | 'doctor';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  records: MedicalRecord[];
  templates: Template[];
  settings: AppSettings;
  users: ClinicalUser[];
}
