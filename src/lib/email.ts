import emailjs from '@emailjs/browser';
import { AppSettings, MedicalRecord } from '../types';

export interface SendPrescriptionEmailInput {
  record: MedicalRecord;
  subject: string;
  settings: AppSettings;
}

export async function sendPrescriptionEmail({ record, subject, settings }: SendPrescriptionEmailInput) {
  if (!settings.emailJsServiceId || !settings.emailJsTemplateId || !settings.emailJsPublicKey) {
    throw new Error('EmailJS პარამეტრები არ არის შევსებული. შეავსეთ Service ID, Template ID და Public Key პარამეტრებში.');
  }

  await emailjs.send(
    settings.emailJsServiceId,
    settings.emailJsTemplateId,
    {
      to_email: record.patient.email,
      to_name: record.patient.name,
      from_name: settings.emailJsFromName || settings.doctorName,
      doctor_name: settings.doctorName,
      doctor_phone: settings.doctorPhone,
      doctor_email: settings.doctorEmail,
      subject,
      patient_name: record.patient.name,
      visit_date: record.patient.visitDate,
      prescription_html: record.prescription,
      message: `მოგესალმებით ${record.patient.name}, გიგზავნით თქვენს სამედიცინო დანიშნულებას.`,
    },
    {
      publicKey: settings.emailJsPublicKey,
    },
  );
}
