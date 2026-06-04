import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { AppSettings, MedicalRecord, Template } from '../types';
import { db } from './firebase';

const settingsRef = doc(db, 'app', 'settings');

export const defaultSettings: AppSettings = {
  doctorName: 'ექიმი გიორგი იმედაშვილი',
  doctorPhone: '591 401 506',
  doctorEmail: 'gimedashvili7@gmail.com',
  doctorPasswordHash: 'giorgi591',
  emailJsServiceId: 'service_4fawvgm',
  emailJsTemplateId: 'template_yzuhn16',
  emailJsPublicKey: '',
  emailJsFromName: 'ექიმი გიორგი იმედაშვილი',
};

const defaultTemplates: Omit<Template, 'id'>[] = [
  {
    name: 'ზოგადი დანიშნულება',
    category: 'ზოგადი დანიშნულება',
    content: '<h4><strong>რეკომენდაციები:</strong></h4><ul><li>ზუსტად დაიცავით დანიშნული მკურნალობის რეჟიმი.</li><li>მდგომარეობის გაუარესების შემთხვევაში დაუკავშირდით მკურნალ ექიმს.</li></ul>',
  },
  {
    name: 'განმეორებითი ვიზიტი',
    category: 'კონტროლი / განმეორებითი ვიზიტი',
    content: '<p>გთხოვთ, გამოცხადდეთ განმეორებით კონსულტაციაზე 10-14 დღის განმავლობაში.</p>',
  },
];

export async function getSettings() {
  const snapshot = await getDoc(settingsRef);
  if (!snapshot.exists()) {
    await setDoc(settingsRef, defaultSettings);
    return defaultSettings;
  }

  return { ...defaultSettings, ...snapshot.data() } as AppSettings;
}

export async function saveSettings(settings: AppSettings) {
  await setDoc(settingsRef, settings, { merge: true });
  return settings;
}

export async function getRecords() {
  const snapshot = await getDocs(query(collection(db, 'records'), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as MedicalRecord);
}

export async function saveRecord(record: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>, id?: string) {
  const now = new Date().toISOString();

  if (id) {
    const ref = doc(db, 'records', id);
    await updateDoc(ref, { ...record, updatedAt: now });
    return { id, ...record, updatedAt: now } as MedicalRecord;
  }

  const ref = await addDoc(collection(db, 'records'), {
    ...record,
    createdAt: now,
    updatedAt: now,
  });
  return { id: ref.id, ...record, createdAt: now, updatedAt: now } as MedicalRecord;
}

export async function deleteRecord(id: string) {
  await deleteDoc(doc(db, 'records', id));
}

export async function getTemplates() {
  const snapshot = await getDocs(collection(db, 'templates'));
  if (snapshot.empty) {
    await Promise.all(defaultTemplates.map((template) => addDoc(collection(db, 'templates'), template)));
    const seeded = await getDocs(collection(db, 'templates'));
    return seeded.docs.map((item) => ({ id: item.id, ...item.data() }) as Template);
  }

  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Template);
}

export async function saveTemplate(template: Omit<Template, 'id'>, id?: string) {
  if (id) {
    const ref = doc(db, 'templates', id);
    await updateDoc(ref, template);
    return { id, ...template } as Template;
  }

  const ref = await addDoc(collection(db, 'templates'), template);
  return { id: ref.id, ...template } as Template;
}

export async function deleteTemplate(id: string) {
  await deleteDoc(doc(db, 'templates', id));
}
