import emailjs from '@emailjs/browser';
import { AppSettings, MedicalRecord } from '../types';

export interface SendPrescriptionEmailInput {
  record: MedicalRecord;
  subject: string;
  settings: AppSettings;
}

function normalizeLine(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function extractInlineText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || '';
  }

  if (!(node instanceof HTMLElement)) {
    return '';
  }

  if (node.tagName === 'BR') {
    return '\n';
  }

  return Array.from(node.childNodes).map(extractInlineText).join('');
}

function blockToText(element: Element, orderedIndex?: number): string[] {
  const tag = element.tagName.toLowerCase();

  if (tag === 'ol') {
    return Array.from(element.children).flatMap((child, index) => blockToText(child, index + 1));
  }

  if (tag === 'ul') {
    return Array.from(element.children).flatMap((child) => blockToText(child));
  }

  if (tag === 'li') {
    const prefix = orderedIndex ? `${orderedIndex}. ` : '- ';
    const ownText = normalizeLine(
      Array.from(element.childNodes)
        .filter((child) => !(child instanceof HTMLElement && ['ol', 'ul'].includes(child.tagName.toLowerCase())))
        .map(extractInlineText)
        .join(''),
    );
    const nested = Array.from(element.children)
      .filter((child) => ['ol', 'ul'].includes(child.tagName.toLowerCase()))
      .flatMap((child) => blockToText(child))
      .map((line) => `  ${line}`);
    return [ownText ? `${prefix}${ownText}` : prefix.trim(), ...nested];
  }

  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
    const text = normalizeLine(extractInlineText(element));
    return text ? [`${text}:`] : [];
  }

  const text = normalizeLine(extractInlineText(element));
  return text ? [text] : [];
}

export function htmlToFormattedText(html: string) {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  return Array.from(doc.body.children)
    .flatMap((child) => blockToText(child))
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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
      date: record.patient.visitDate,
      prescription_text: htmlToFormattedText(record.prescription),
      recommendations: '',
      contact_info: `ტელ: ${settings.doctorPhone}\nელ-ფოსტა: ${settings.doctorEmail}`,
      visit_date: record.patient.visitDate,
      prescription_html: record.prescription,
      message: `მოგესალმებით ${record.patient.name}, გიგზავნით თქვენს სამედიცინო დანიშნულებას.`,
    },
    {
      publicKey: settings.emailJsPublicKey,
    },
  );
}
