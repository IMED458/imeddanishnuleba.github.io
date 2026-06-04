import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, UserCircle, Settings as SettingsIcon, FileText, 
  Trash2, Mail, Download, Layers, Calendar, ChevronRight, CheckCircle2, 
  Send, Eye, Copy, RefreshCw, LogOut, ArrowLeft, Phone, Info, AlertTriangle, FileUp, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RichEditor from './components/RichEditor';
import Login from './components/Login';
import { MedicalRecord, Template, TemplateCategory, AppSettings } from './types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentTab, setCurrentTab] = useState<'DASHBOARD' | 'NEW_RECORD' | 'ARCHIVE' | 'TEMPLATES' | 'SETTINGS'>('DASHBOARD');
  
  // Data State
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // New Record State
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('მამრობითი');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [visitDate, setVisitDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [patientNotes, setPatientNotes] = useState('');

  const [complaints, setComplaints] = useState('');
  const [anamnesis, setAnamnesis] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  
  // Editing Record ID state
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  // Template Form State
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState<TemplateCategory>('ზოგადი დანიშნულება');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<TemplateCategory | 'ყველა'>('ყველა');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Search/Filters in Archive
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDiagnosis, setFilterDiagnosis] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Active Print/Preview Modal
  const [activePrintRecord, setActivePrintRecord] = useState<MedicalRecord | null>(null);
  const [printType, setPrintType] = useState<'PATIENT_ONLY' | 'FULL_CLINICAL'>('PATIENT_ONLY');

  // Email Flow
  const [activeEmailRecord, setActiveEmailRecord] = useState<MedicalRecord | null>(null);
  const [customEmailSubject, setCustomEmailSubject] = useState('');
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [sendingEmail, setSendingEmail] = useState(false);

  // Load Initial Session auth from localStorage
  useEffect(() => {
    const savedPass = localStorage.getItem('doctor_auth_password');
    if (savedPass) {
      verifySavedPassword(savedPass);
    } else {
      setLoading(false);
    }
  }, []);

  const verifySavedPassword = async (pass: string) => {
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass })
      });
      if (res.ok) {
        setIsAuthenticated(true);
        fetchInitialData();
      } else {
        localStorage.removeItem('doctor_auth_password');
        setLoading(false);
      }
    } catch {
      localStorage.removeItem('doctor_auth_password');
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    fetchInitialData();
  };

  const logout = () => {
    localStorage.removeItem('doctor_auth_password');
    setIsAuthenticated(false);
    setCurrentTab('DASHBOARD');
  };

  // Fetch from Express REST APIs
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [recRes, tempRes, setRes] = await Promise.all([
        fetch('/api/records'),
        fetch('/api/templates'),
        fetch('/api/settings')
      ]);

      if (recRes.ok) setRecords(await recRes.json());
      if (tempRes.ok) setTemplates(await tempRes.json());
      if (setRes.ok) setSettings(await setRes.json());
    } catch (err) {
      console.error('Error fetching backend data: ', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save form contents locally so the doctor doesn't lose progress on page reload
  useEffect(() => {
    if (currentTab === 'NEW_RECORD') {
      const draft = {
        patientName, patientAge, patientGender, patientPhone, patientEmail, visitDate, patientNotes,
        complaints, anamnesis, diagnosis, prescription, doctorNotes, editingRecordId
      };
      localStorage.setItem('prescription_form_draft', JSON.stringify(draft));
    }
  }, [
    patientName, patientAge, patientGender, patientPhone, patientEmail, visitDate, patientNotes,
    complaints, anamnesis, diagnosis, prescription, doctorNotes, currentTab, editingRecordId
  ]);

  // Load draft if available
  const loadDraft = () => {
    const raw = localStorage.getItem('prescription_form_draft');
    if (raw) {
      try {
        const draft = JSON.parse(raw);
        setPatientName(draft.patientName || '');
        setPatientAge(draft.patientAge || '');
        setPatientGender(draft.patientGender || 'მამრობითი');
        setPatientPhone(draft.patientPhone || '');
        setPatientEmail(draft.patientEmail || '');
        setVisitDate(draft.visitDate || new Date().toISOString().split('T')[0]);
        setPatientNotes(draft.patientNotes || '');
        setComplaints(draft.complaints || '');
        setAnamnesis(draft.anamnesis || '');
        setDiagnosis(draft.diagnosis || '');
        setPrescription(draft.prescription || '');
        setDoctorNotes(draft.doctorNotes || '');
        setEditingRecordId(draft.editingRecordId || null);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('prescription_form_draft');
    setPatientName('');
    setPatientAge('');
    setPatientGender('მამრობითი');
    setPatientPhone('');
    setPatientEmail('');
    setVisitDate(new Date().toISOString().split('T')[0]);
    setPatientNotes('');
    setComplaints('');
    setAnamnesis('');
    setDiagnosis('');
    setPrescription('');
    setDoctorNotes('');
    setEditingRecordId(null);
  };

  // Save new/edited Medical Record
  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert('მიუთითეთ პაციენტის სახელი და გვარი');
      return;
    }

    const payload = {
      patient: {
        name: patientName,
        age: patientAge,
        gender: patientGender,
        phone: patientPhone,
        email: patientEmail,
        visitDate,
        notes: patientNotes
      },
      complaints,
      anamnesis,
      diagnosis,
      prescription,
      doctorNotes
    };

    try {
      let res;
      if (editingRecordId) {
        res = await fetch(`/api/records/${editingRecordId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        clearDraft();
        await fetchInitialData();
        setCurrentTab('ARCHIVE');
        alert(editingRecordId ? 'ჩანაწერი განახლდა!' : 'ჩანაწერი წარმატებით შეინახა არქივში!');
      } else {
        alert('მონაცემების შენახვა ვერ მოხერხდა.');
      }
    } catch (err) {
      console.error(err);
      alert('სერვერთან კავშირი გაწყდა.');
    }
  };

  // Handle Editing from Archive
  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecordId(record.id);
    setPatientName(record.patient.name);
    setPatientAge(record.patient.age);
    setPatientGender(record.patient.gender);
    setPatientPhone(record.patient.phone);
    setPatientEmail(record.patient.email);
    setVisitDate(record.patient.visitDate);
    setPatientNotes(record.patient.notes || '');
    setComplaints(record.complaints);
    setAnamnesis(record.anamnesis);
    setDiagnosis(record.diagnosis);
    setPrescription(record.prescription);
    setDoctorNotes(record.doctorNotes);

    setCurrentTab('NEW_RECORD');
  };

  // Duplicate / Clinically Re-apply Record as a fresh starting point
  const handleDuplicateRecord = (record: MedicalRecord) => {
    setEditingRecordId(null); // Fresh record
    setPatientName(record.patient.name);
    setPatientAge(record.patient.age);
    setPatientGender(record.patient.gender);
    setPatientPhone(record.patient.phone);
    setPatientEmail(record.patient.email);
    setVisitDate(new Date().toISOString().split('T')[0]); // Today's date
    setPatientNotes(record.patient.notes || '');
    setComplaints(record.complaints);
    setAnamnesis(record.anamnesis);
    setDiagnosis(record.diagnosis);
    setPrescription(record.prescription);
    setDoctorNotes('');

    setCurrentTab('NEW_RECORD');
    alert('ჩანაწერი დადუბლირდა! თარიღი ავტომატურად განახლდა დღევანდელი დღით.');
  };

  // Delete Record
  const handleDeleteRecord = async (id: string) => {
    if (!confirm('ჩანაწერის წაშლა სამუდამოდ წაშლის მონაცემებს არქივიდან. დარწმუნებული ხართ?')) return;
    try {
      const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRecords(records.filter(r => r.id !== id));
      } else {
        alert('წაშლა ვერ მოხერხდა.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Set up details for printing
  const startPrintFlow = (record: MedicalRecord, type: 'PATIENT_ONLY' | 'FULL_CLINICAL') => {
    setActivePrintRecord(record);
    setPrintType(type);
    
    const handleAfterPrint = () => {
      setActivePrintRecord(null);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
    window.addEventListener('afterprint', handleAfterPrint);

    // Tiny delay to let browser mount printing overlay, then call print
    setTimeout(() => {
      window.print();
    }, 400);
  };

  // Launch Email Composer
  const openEmailComposer = (record: MedicalRecord) => {
    setActiveEmailRecord(record);
    setCustomEmailSubject(`სამედიცინო დანიშნულება - ${settings?.doctorName || 'ექიმი გიორგი იმედაშვილი'}`);
    setEmailStatus({ type: null, message: '' });
  };

  // Send email to patient
  const handleSendEmail = async () => {
    if (!activeEmailRecord) return;
    if (!activeEmailRecord.patient.email) {
      alert('პაციენტს ელ-ფოსტა მითითებული არ აქვს! გთხოვთ ჯერ ჩაუწეროთ ელ-ფოსტა.');
      return;
    }

    setSendingEmail(true);
    setEmailStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: activeEmailRecord.patient.email,
          subject: customEmailSubject,
          patientName: activeEmailRecord.patient.name,
          visitDate: activeEmailRecord.patient.visitDate,
          prescriptionHtml: activeEmailRecord.prescription,
          emailBody: `მოგესალმებით ${activeEmailRecord.patient.name}, თანდართულ წერილში იხილავთ თქვენს რეცეპტს ექიმ გიორგი იმედაშვილისგან.`
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEmailStatus({
          type: 'success',
          message: data.message || 'დანიშნულება წარმატებით გაეგზავნა პაციენტს!'
        });
      } else {
        setEmailStatus({
          type: 'error',
          message: data.message || 'ელ-ფოსტის გაგზავნა ვერ მოხერხდა. გადაამოწმეთ SMTP პარამეტრები.'
        });
      }
    } catch (err) {
      console.error(err);
      setEmailStatus({
        type: 'error',
        message: 'ელ-ფოსტის გაგზავნისას დაფიქსირდა ტექნიკური შეცდომა.'
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // Save/Create clinical template
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim() || !newTemplateContent.trim()) {
      alert('მიუთითეთ შაბლონის სათაური და ტექსტი');
      return;
    }

    const payload = {
      name: newTemplateName,
      category: newTemplateCategory,
      content: newTemplateContent
    };

    try {
      let res;
      if (editingTemplateId) {
        res = await fetch(`/api/templates/${editingTemplateId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setNewTemplateName('');
        setNewTemplateContent('');
        setEditingTemplateId(null);
        await fetchInitialData();
        alert(editingTemplateId ? 'შაბლონი განახლდა!' : 'შაბლონი წარმატებით შეიქმნა!');
      } else {
        alert('შაბლონის შენახვა ვერ მოხერხდა.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Insert Template directly into Rich Text editor
  const handleInsertTemplate = (tpl: Template) => {
    // Append or overwrite prescription
    const selection = confirm('გსურთ ამ შაბლონის დანიშნულების ტექსტს ბოლოში მიუწეროთ? "Ok" - მიუწერს ბოლოში, "Cancel" - წაშლის არსებულს და ჩაანაცვლებს.');
    if (selection) {
      setPrescription(prev => prev ? prev + '<br/>' + tpl.content : tpl.content);
    } else {
      setPrescription(tpl.content);
    }
    alert('შაბლონი წარმატებით ჩაისვა რედაქტორში!');
  };

  const handleEditTemplate = (tpl: Template) => {
    setEditingTemplateId(tpl.id);
    setNewTemplateName(tpl.name);
    setNewTemplateCategory(tpl.category);
    setNewTemplateContent(tpl.content);
    // Scroll smoothly to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('დარწმუნებული ხართ, რომ გსურთ შაბლონის წაშლა?')) return;
    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTemplates(templates.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Duplicating a template
  const handleDuplicateTemplate = async (tpl: Template) => {
    try {
      const payload = {
        name: `${tpl.name} (ასლი)`,
        category: tpl.category,
        content: tpl.content
      };
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchInitialData();
        alert('შაბლონის დუბლირება წარმატებით დასრულდა!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Settings from database configuration
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('პარამეტრები წარმატებით შეინახა ბაზაში!');
        await fetchInitialData();
      } else {
        alert('შეცდომა პარამეტრების შენახვისას.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtering Archive
  const filteredRecords = records.filter(rec => {
    const query = searchQuery.toLowerCase();
    const nameMatch = rec.patient.name.toLowerCase().includes(query) || 
                      rec.patient.phone.includes(query) ||
                      (rec.patient.email && rec.patient.email.toLowerCase().includes(query));
    
    const diagMatch = !filterDiagnosis || rec.diagnosis.toLowerCase().includes(filterDiagnosis.toLowerCase());
    const dateMatch = !filterDate || rec.patient.visitDate === filterDate;

    return nameMatch && diagMatch && dateMatch;
  });

  if (loading && !settings) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="mt-4 text-emerald-800 font-medium">სისტემა იტვირთება, გთხოვთ მოითმინოთ...</p>
      </div>
    );
  }

  // If not authenticated, lock under doctor credentials check
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <>
      {/* ----------------- PRINTER VISUAL OVERLAY (print-only) ----------------- */}
      {activePrintRecord && (
        <div className="hidden print:block print-card text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>
          {/* Executive Clinic Header */}
          <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '20px', marginBottom: '30px' }}>
            <div style={{ float: 'right', textAlign: 'right', fontSize: '9.5pt', color: '#475569', lineHeight: '1.5' }}>
              <p style={{ margin: '0 0 2px 0' }}><strong>მობ:</strong> {settings?.doctorPhone}</p>
              <p style={{ margin: '0 0 2px 0' }}><strong>ელ-ფოსტა:</strong> {settings?.doctorEmail}</p>
              <p style={{ margin: '0' }}><strong>თარიღი:</strong> {activePrintRecord.patient.visitDate}</p>
            </div>
            {/* Minimalist Medical Letterhead Symbol */}
            <div style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '12px', width: '28px', height: '28px', border: '1.5px solid #0f172a', position: 'relative', borderRadius: '4px' }}>
              <div style={{ position: 'absolute', top: '5px', left: '12px', width: '2px', height: '14px', backgroundColor: '#0f172a' }}></div>
              <div style={{ position: 'absolute', top: '11px', left: '6px', width: '14px', height: '2px', backgroundColor: '#0f172a' }}></div>
            </div>
            <h2 style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0', fontSize: '18pt', fontWeight: 'bold', color: '#0f172a', letterSpacing: '0.5px' }}>
              {settings?.doctorName || 'ექიმი გიორგი იმედაშვილი'}
            </h2>
            <p style={{ margin: '6px 0 0 40px', fontSize: '10pt', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>ინდივიდუალური სამედიცინო დანიშნულების ბარათი</p>
          </div>

          {/* Patient Details Card */}
          <div style={{ marginBottom: '30px', border: '1px solid #cbd5e1', padding: '16px', borderRadius: '4px', fontStyle: 'normal' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 0', width: '140px', fontWeight: 'bold', color: '#475569' }}>პაციენტი:</td>
                  <td style={{ padding: '4px 0', fontWeight: 'bold', color: '#0b1329' }}>{activePrintRecord.patient.name}</td>
                  <td style={{ padding: '4px 0', width: '100px', fontWeight: 'bold', color: '#475569', textAlign: 'right' }}>თარიღი:</td>
                  <td style={{ padding: '4px 0', fontWeight: 'bold', color: '#0b1329', textAlign: 'right' }}>{activePrintRecord.patient.visitDate}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 'bold', color: '#475569' }}>ასაკი / სქესი:</td>
                  <td style={{ padding: '4px 0' }}>{activePrintRecord.patient.age} წელი | {activePrintRecord.patient.gender}</td>
                  {activePrintRecord.patient.phone && (
                    <>
                      <td style={{ padding: '4px 0', fontWeight: 'bold', color: '#475569', textAlign: 'right' }}>ტელეფონი:</td>
                      <td style={{ padding: '4px 0', color: '#0b1329', textAlign: 'right' }}>{activePrintRecord.patient.phone}</td>
                    </>
                  )}
                </tr>
              </tbody>
            </table>
          </div>

          {/* If Full Clinic Document, print extra clinical details */}
          {printType === 'FULL_CLINICAL' && (
            <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #cbd5e1', fontSize: '10.5pt', lineHeight: '1.6' }}>
              <h3 style={{ color: '#0f172a', borderBottom: '1.5px solid #0f172a', paddingBottom: '4px', marginTop: '0', fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>კლინიკური მონაცემები</h3>
              <p style={{ margin: '8px 0' }}><strong>ჩივილი:</strong> {activePrintRecord.complaints || 'არ არის მითითებული'}</p>
              <p style={{ margin: '8px 0' }}><strong>ანამნეზი:</strong> {activePrintRecord.anamnesis || 'არ არის მითითებული'}</p>
              <p style={{ margin: '8px 0' }}><strong>დიაგნოზი:</strong> {activePrintRecord.diagnosis || 'არ არის მითითებული'}</p>
              {activePrintRecord.doctorNotes && <p style={{ margin: '8px 0' }}><strong>ექიმის შენიშვნა:</strong> {activePrintRecord.doctorNotes}</p>}
            </div>
          )}

          {/* PRESCRIPTION BLOCK */}
          <div style={{ marginTop: '20px', padding: '24px', border: '1.5px solid #0f172a', borderRadius: '4px', backgroundColor: '#fcfcfc' }}>
            <h3 style={{ color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginTop: '0', fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>დანიშნულება და მკურნალობის რეჟიმი</h3>
            <div 
              className="prose-editor" 
              style={{ fontSize: '11pt', marginTop: '16px', lineHeight: '1.7', color: '#0f172a' }}
              dangerouslySetInnerHTML={{ __html: activePrintRecord.prescription }} 
            />
          </div>

          {/* Compliance notice */}
          <p style={{ marginTop: '40px', fontSize: '9.5pt', color: '#475569', fontStyle: 'italic', textAlign: 'center' }}>
            გთხოვთ, ზუსტად დაიცვათ დანიშნულება და მკურნალობის რეჟიმი.
          </p>

          {/* Professional Formal Footer with Hand Signature & Seal */}
          <div style={{ marginTop: '80px', paddingTop: '20px', borderTop: '1px solid #cbd5e1' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  {/* Left Column: Stamp Space */}
                  <td style={{ width: '50%', textAlign: 'left', verticalAlign: 'top' }}>
                    <div style={{ display: 'inline-block', textAlign: 'center', color: '#94a3b8' }}>
                      <div style={{ width: '90px', height: '90px', borderRadius: '50%', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8.5pt', color: '#94a3b8' }}>
                        ბ.ა. / Seal
                      </div>
                    </div>
                  </td>
                  {/* Right Column: Original Hand Signature */}
                  <td style={{ width: '50%', textAlign: 'right', verticalAlign: 'bottom' }}>
                    <div style={{ display: 'inline-block', textAlign: 'left', width: '220px', fontSize: '10pt' }}>
                      <p style={{ margin: '0 0 40px 0', color: '#64748b', fontSize: '9.5pt' }}>ექიმის ხელმოწერა:</p>
                      <div style={{ borderBottom: '1px solid #0f172a', marginBottom: '8px' }}></div>
                      <p style={{ margin: '0', fontWeight: 'bold', color: '#0f172a' }}>{settings?.doctorName}</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- WEB GRAPHICAL LAYOUT (desktop + mobile) ----------------- */}
      <div className="no-print min-h-screen bg-[#fafbfc] text-slate-800 flex flex-col relative pb-28 md:pb-6">
        
        {/* Navigation Rail / Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3 shadow-sm shadow-slate-100/50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold leading-none">
                GI
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-800 leading-none">
                  დანიშნულების მართვა
                </h1>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                  {settings?.doctorName} • 591 401 506
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentTab('DASHBOARD')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${currentTab === 'DASHBOARD' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                მთავარი
              </button>
              <button 
                onClick={() => { clearDraft(); setCurrentTab('NEW_RECORD'); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${currentTab === 'NEW_RECORD' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                ახალი ვიზიტი
              </button>
              <button 
                onClick={() => setCurrentTab('ARCHIVE')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${currentTab === 'ARCHIVE' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                პაციენტების არქივი
              </button>
              <button 
                onClick={() => setCurrentTab('TEMPLATES')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${currentTab === 'TEMPLATES' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                შაბლონები
              </button>
              <button 
                onClick={() => setCurrentTab('SETTINGS')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${currentTab === 'SETTINGS' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                პარამეტრები
              </button>
            </nav>

            <button
              onClick={logout}
              className="px-2.5 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold hover:bg-red-50 hover:text-red-600 cursor-pointer transition flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">გამოსვლა</span>
            </button>

          </div>
        </header>

        {/* Outer Content frame */}
        <main className="max-w-7xl mx-auto p-4 md:py-8">
          
          {/* =========================================================================
              TAB: DASHBOARD
              ========================================================================= */}
          {currentTab === 'DASHBOARD' && (
            <div className="space-y-6">
              
              {/* Profile Card / Greetings */}
              <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-xl shadow-emerald-950/10">
                <div className="max-w-xl">
                  <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-400/20">
                    სამედიცინო პორტალი
                  </span>
                  <h2 className="text-2xl font-bold mt-3">გამარჯობა, {settings?.doctorName}!</h2>
                  <p className="text-emerald-100/80 text-xs md:text-sm mt-1 mb-6 leading-relaxed">
                    აქედან მარტივად შეგიძლიათ პაციენტის ვიზიტის შექმნა, შაბლონების გამოყენება და რეცეპტების ელ-ფოსტით გაგზავნა პერსონალურ ექიმის გვერდზე.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => { clearDraft(); setCurrentTab('NEW_RECORD'); }}
                      className="px-4 py-2.5 bg-white text-slate-800 hover:bg-emerald-50 rounded-xl text-xs font-bold font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-emerald-700" />
                      ახალი დანიშნულება
                    </button>
                    <button
                      onClick={() => setCurrentTab('ARCHIVE')}
                      className="px-4 py-2.5 bg-emerald-700/60 hover:bg-emerald-700/80 border border-emerald-500/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      არქივის ნახვა
                    </button>
                  </div>
                </div>
              </div>

              {/* Counts Box */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <UserCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-400 leading-none">სულ პაციენტი</h4>
                    <p className="text-xl font-bold text-slate-700 mt-1">{records.length}</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-400 leading-none">შაბლონები</h4>
                    <p className="text-xl font-bold text-slate-700 mt-1">{templates.length}</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 col-span-2">
                  <div className="p-3 bg-pink-50 text-pink-600 rounded-lg">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-400 leading-none">ბოლო ვიზიტი</h4>
                    <p className="text-xs font-bold text-slate-700 mt-1">
                      {records.length > 0 ? records[0].patient.name + ' (' + records[0].patient.visitDate + ')' : 'ვიზიტები ჯერ არ არის'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Patient List */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-700">ბოლო ჩანაწერები</h3>
                  <button 
                    onClick={() => setCurrentTab('ARCHIVE')} 
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    ყველა ჩანაწერი
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {records.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    ჩანაწერები ჯერ არ მოიძებნება.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {records.slice(0, 4).map((rec) => (
                      <div key={rec.id} className="py-3 flex flex-wrap items-center justify-between gap-2 hover:bg-slate-50/50 px-1 rounded-lg transition">
                        <div>
                          <p className="text-xs font-bold text-slate-700">{rec.patient.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">ასაკი: {rec.patient.age} წ • დიაგნოზი: <span className="font-medium text-slate-600">{rec.diagnosis || 'არ არის'}</span></p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startPrintFlow(rec, 'PATIENT_ONLY')}
                            className="p-1 px-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded text-[11px] font-semibold flex items-center gap-1 transition"
                            title="პაციენტის დანიშნულების PDF"
                          >
                            <Download className="w-3 h-3" />
                            PDF
                          </button>
                          <button 
                            onClick={() => handleEditRecord(rec)}
                            className="p-1 px-2 border border-emerald-100 text-emerald-700 hover:bg-emerald-50 rounded text-[11px] font-bold flex items-center transition"
                          >
                            რედაქტირება
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}


          {/* =========================================================================
              TAB: NEW_RECORD / PRESCRIPTION CREATOR
              ========================================================================= */}
          {currentTab === 'NEW_RECORD' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {editingRecordId ? 'ვიზიტის დანიშნულების რედაქტირება' : 'ახალი სამედიცინო ვიზიტი და დანიშნულება'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    შეავსეთ პალატის ჩანაწერი, ანამნეზი და ჩივილები, ხოლო დანიშნულება გაუგზავნეთ პაციენტს
                  </p>
                </div>
                {editingRecordId && (
                  <button 
                    onClick={() => { clearDraft(); setEditingRecordId(null); }}
                    className="p-1.5 px-3 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 flex items-center gap-1 cursor-pointer transition"
                  >
                    გაუქმება / ახალი
                  </button>
                )}
              </div>

              {/* Core Master Form */}
              <form onSubmit={handleSaveRecord} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Inputs Columns */}
                <div className="lg:col-span-2 space-y-5">
                  
                  {/* PATIENT PROFILE CARD */}
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-2 flex items-center gap-1.5">
                      <UserCircle className="w-4 h-4 text-emerald-600" />
                      1. პაციენტის მონაცემები
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">პაციენტის სახელი და გვარი *</label>
                        <input
                          type="text"
                          required
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder="მაგ: გიორგი კაპანაძე"
                          className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs md:text-sm outline-none focus:border-emerald-500 transition"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">ასაკი (წელი)</label>
                          <input
                            type="number"
                            value={patientAge}
                            onChange={(e) => setPatientAge(e.target.value)}
                            placeholder="35"
                            className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">სქესი</label>
                          <select
                            value={patientGender}
                            onChange={(e) => setPatientGender(e.target.value)}
                            className="w-full h-10 px-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 bg-white"
                          >
                            <option value="მამრობითი">მამრობითი</option>
                            <option value="მდედრობითი">მდედრობითი</option>
                            <option value="სხვა">სხვა</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">ტელეფონის ნომერი</label>
                        <input
                          type="text"
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          placeholder="მაგ: 599 112 233"
                          className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">ელექტრონული ფოსტა</label>
                        <input
                          type="email"
                          value={patientEmail}
                          onChange={(e) => setPatientEmail(e.target.value)}
                          placeholder="giorgi@email.com"
                          className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">ვიზიტის თარიღი</label>
                        <input
                          type="date"
                          value={visitDate}
                          onChange={(e) => setVisitDate(e.target.value)}
                          className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">დამატებითი შენიშვნა</label>
                        <input
                          type="text"
                          value={patientNotes}
                          onChange={(e) => setPatientNotes(e.target.value)}
                          placeholder="მაგ: ურეკავს მხოლოდ კვირას"
                          className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CLINICAL DATA CARD */}
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-2 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      2. ანამნეზი და ჩივილები (ინახება მხოლოდ არქივში)
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">პაციენტის ძირითადი ჩივილები</label>
                        <textarea
                          rows={2}
                          value={complaints}
                          onChange={(e) => setComplaints(e.target.value)}
                          placeholder="მიუთითეთ პაციენტის მიმდინარე ჩივილები..."
                          className="w-full p-3 border border-slate-200 rounded-lg text-xs md:text-sm outline-none focus:border-emerald-500 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">ანამნეზი (დაავადების განვითარება/ისტორია)</label>
                        <textarea
                          rows={2}
                          value={anamnesis}
                          onChange={(e) => setAnamnesis(e.target.value)}
                          placeholder="მიუთითეთ დაავადების ანამნეზი..."
                          className="w-full p-3 border border-slate-200 rounded-lg text-xs md:text-sm outline-none focus:border-emerald-500 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">დიაგნოზი (ძირითადი და თანმხლები)</label>
                        <input
                          type="text"
                          value={diagnosis}
                          onChange={(e) => setDiagnosis(e.target.value)}
                          placeholder="მაგ: მწვავე გასტრიტი (K29.1)"
                          className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs md:text-sm outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PRESCRIPTION EDITOR */}
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        3. დანიშნულება (ეგზავნება პაციენტს!)
                      </h3>
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold border border-amber-100">
                        * იგზავნება მხოლოდ დანიშნულება
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">სამკურნალო დანიშნულება და რეჟიმი</label>
                        <RichEditor
                          value={prescription}
                          onChange={setPrescription}
                          placeholder="დაწერეთ რეცეპტი, დოზირებები, მედიკამენტები და რეჟიმები აქ..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">ექიმის შიდა შენიშვნები (არ ეგზავნება პაციენტს)</label>
                        <textarea
                          rows={2}
                          value={doctorNotes}
                          onChange={(e) => setDoctorNotes(e.target.value)}
                          placeholder="მხოლოდ ექიმის შიდა მოხმარებისთვის, კლინიკური დინამიკის დასანიშნად..."
                          className="w-full p-3 border border-slate-200 rounded-lg text-xs md:text-sm outline-none focus:border-red-400 focus:ring-red-50 focus:ring-2 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SUBMIT ACTIONS */}
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={clearDraft}
                      className="px-5 py-3 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                    >
                      გასუფთავება
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-600/10"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {editingRecordId ? 'რედაქტირების შენახვა' : 'შენახვა არქივში'}
                    </button>
                  </div>

                </div>

                {/* Left Drawer / Templates System quick panel */}
                <div className="space-y-5">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        შაბლონების ჩასმა
                      </h4>
                      <button 
                        type="button" 
                        onClick={() => setCurrentTab('TEMPLATES')}
                        className="text-[10px] text-emerald-600 hover:underline font-bold"
                      >
                        მართვა
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-normal">
                      დააჭირეთ შაბლონს, რომ ის ავტომატურად ჩაიწეროს თქვენს ძირითად დანიშნულების რედაქტორში.
                    </p>

                    {templates.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-400">
                        შაბლონები ჯერ არ გაქვთ შექმნილი.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                        {templates.map(tpl => (
                          <div
                            key={tpl.id}
                            onClick={() => handleInsertTemplate(tpl)}
                            className="p-2.5 bg-white hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 rounded-lg cursor-pointer transition text-left group"
                          >
                            <span className="text-[8px] uppercase tracking-wider font-bold bg-slate-100 group-hover:bg-emerald-100/50 text-slate-500 group-hover:text-emerald-700 px-1.5 py-0.5 rounded">
                              {tpl.category}
                            </span>
                            <h5 className="text-[11px] font-bold text-slate-700 mt-1">{tpl.name}</h5>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5" dangerouslySetInnerHTML={{ __html: tpl.content.substring(0, 80) }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </form>

            </div>
          )}


          {/* =========================================================================
              TAB: ARCHIVE (COMPREHENSIVE RECORDS LIST)
              ========================================================================= */}
          {currentTab === 'ARCHIVE' && (
            <div className="space-y-5">
              
              <div>
                <h2 className="text-lg font-bold text-slate-800">პაციენტთა სამედიცინო არქივი</h2>
                <p className="text-xs text-slate-400">
                  ექიმი გიორგის სრული სამედიცინო ჩანაწერები და არქივი. დუბლირება, ექსპორტი და პაციენტზე დაგზავნა
                </p>
              </div>

              {/* Filtering Suite */}
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="პაციენტის სახელი, მობილური ან იმეილი..."
                    className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={filterDiagnosis}
                    onChange={(e) => setFilterDiagnosis(e.target.value)}
                    placeholder="დიაგნოზით გაფილტვრა..."
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Records rendering */}
              <div className="space-y-3">
                {filteredRecords.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-xs text-slate-400 shadow-sm">
                    არცერთი სამედიცინო ჩანაწერი არ მოიძებნა მითითებული პარამეტრებით.
                  </div>
                ) : (
                  filteredRecords.map((rec) => (
                    <div 
                      key={rec.id}
                      className="bg-white border border-slate-100 rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition space-y-4"
                    >
                      {/* Card Header (Patient personal info) */}
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-50 pb-3">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold bg-slate-50 px-2 py-0.5 rounded">
                              {rec.patient.visitDate}
                            </span>
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-100">
                              Id: {rec.id}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-800 mt-1">{rec.patient.name}</h3>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                            <span>ასაკი: <strong>{rec.patient.age || '—'} წ</strong></span>
                            <span>სქესი: <strong>{rec.patient.gender}</strong></span>
                            {rec.patient.phone && (
                              <span className="flex items-center gap-0.5 text-slate-500">
                                <Phone className="w-3 h-3 text-emerald-600" />
                                {rec.patient.phone}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Control Actions buttons */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => openEmailComposer(rec)}
                            className="p-2 border border-blue-150 hover:bg-blue-50 text-blue-600 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="პაციენტთან ელ-ფოსტით გაგზავნა"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            გაგზავნა
                          </button>
                          
                          {/* Printable/Save PDF downloads */}
                          <div className="relative inline-block text-left group">
                            <button
                              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              PDF
                            </button>
                            {/* Dropdown overlay */}
                            <div className="hidden group-hover:block absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                              <button
                                onClick={() => startPrintFlow(rec, 'PATIENT_ONLY')}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-slate-700 border-b border-slate-100 font-medium"
                              >
                                📋 მხოლოდ რეცეპტი (პაციენტისთვის)
                              </button>
                              <button
                                onClick={() => startPrintFlow(rec, 'FULL_CLINICAL')}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-slate-700 font-medium"
                              >
                                🗄️ სრული და ბარათი (ექიმისთვის)
                              </button>
                            </div>
                          </div>

                          <span className="h-6 w-px bg-slate-100 mx-1"></span>

                          <button
                            onClick={() => handleDuplicateRecord(rec)}
                            className="p-2 border border-slate-100 hover:bg-slate-100 text-slate-500 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            title="ვიზიტის დადუბლირება ახალ ვიზიტად"
                          >
                            დუბლირება
                          </button>

                          <button
                            onClick={() => handleEditRecord(rec)}
                            className="p-2 border border-emerald-100 text-emerald-700 hover:bg-emerald-50 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            ჩასწორება
                          </button>

                          <button
                            onClick={() => handleDeleteRecord(rec.id)}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Diagnostic details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                        
                        {/* LEFT (Diagnostic inputs for security) */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/40 space-y-2">
                          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 text-blue-600" />
                            კლინიკური დიაგნოზი (შიდა არქივი)
                          </h4>
                          <div>
                            <span className="font-bold text-slate-600">ჩივილები:</span>
                            <p className="text-slate-500 mt-0.5 leading-relaxed">{rec.complaints || 'პაციენტს ჩივილები არ აქვს'}</p>
                          </div>
                          <div>
                            <span className="font-bold text-slate-600">ანამნეზი:</span>
                            <p className="text-slate-500 mt-0.5 leading-relaxed">{rec.anamnesis || 'არ არის შევსებული'}</p>
                          </div>
                          <div>
                            <span className="font-bold text-slate-600">ძირითადი დიაგნოზი:</span>
                            <p className="text-slate-700 font-medium mt-0.5">{rec.diagnosis || 'მორიგე რეგისტრაცია'}</p>
                          </div>
                          {rec.doctorNotes && (
                            <div className="border-t border-slate-200/50 pt-2 mt-2">
                              <span className="font-bold text-red-700 text-[10px] uppercase">ექიმის შიდა შენიშვნა:</span>
                              <p className="text-red-900/80 italic mt-0.5">{rec.doctorNotes}</p>
                            </div>
                          )}
                        </div>

                        {/* RIGHT (Prescription copy) */}
                        <div className="border border-slate-200/50 p-3.5 rounded-lg bg-white space-y-2">
                          <h4 className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            გაზიარებული სამედიცინო რეცეპტი:
                          </h4>
                          <div 
                            className="prose-editor text-slate-700 overflow-y-auto max-h-[160px] text-xs pr-1 border-l-4 border-slate-100 pl-3.5"
                            dangerouslySetInnerHTML={{ __html: rec.prescription || 'ცარიელია' }}
                          />
                        </div>

                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          )}


          {/* =========================================================================
              TAB: TEMPLATES (Blueprints Engine)
              ========================================================================= */}
          {currentTab === 'TEMPLATES' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">დანიშნულების შაბლონები</h2>
                  <p className="text-xs text-slate-400">
                    შექმენით სწრაფი რეცეპტები, წამლების კატეგორიები და დინამიური რეკომენდაციები
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Create/Edit form template */}
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm h-fit space-y-4">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-50 pb-2">
                    {editingTemplateId ? 'შაბლონის რედაქტირება' : 'ახალი შაბლონის შექმნა'}
                  </h3>

                  <form onSubmit={handleSaveTemplate} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">შაბლონის დასახელება</label>
                      <input
                        type="text"
                        required
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        placeholder="მაგ: კუჭის დიეტა"
                        className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">შაბლონის კატეგორია</label>
                      <select
                        value={newTemplateCategory}
                        onChange={(e) => setNewTemplateCategory(e.target.value as TemplateCategory)}
                        className="w-full h-10 px-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 bg-white"
                      >
                        <option value="ზოგადი დანიშნულება">ზოგადი დანიშნულება</option>
                        <option value="კვლევები">კვლევები</option>
                        <option value="მედიკამენტები">მედიკამენტები</option>
                        <option value="რეკომენდაციები">რეკომენდაციები</option>
                        <option value="კონტროლი / განმეორებითი ვიზიტი">კონტროლი / განმეორებითი ვიზიტი</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">დანიშნულების ტექსტი (რედაქტორი)</label>
                      <RichEditor
                        value={newTemplateContent}
                        onChange={setNewTemplateContent}
                        placeholder="ჩაწერეთ შაბლონის დეტალები..."
                      />
                    </div>

                    <div className="flex gap-2">
                      {editingTemplateId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTemplateId(null);
                            setNewTemplateName('');
                            setNewTemplateContent('');
                          }}
                          className="flex-1 px-4 py-2 text-xs border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition"
                        >
                          გაუქმება
                        </button>
                      )}
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
                      >
                        {editingTemplateId ? 'განახლება' : 'შაბლონის დამახსოვრება'}
                      </button>
                    </div>

                  </form>
                </div>

                {/* Grid layout of templates */}
                <div className="lg:col-span-2 space-y-4">
                  
                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-1.5 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm justify-start">
                    {(['ყველა', 'ზოგადი დანიშნულება', 'კვლევები', 'მედიკამენტები', 'რეკომენდაციები', 'კონტროლი / განმეორებითი ვიზიტი'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedTemplateCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${selectedTemplateCategory === cat ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Render Template Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates
                      .filter(tpl => selectedTemplateCategory === 'ყველა' || tpl.category === selectedTemplateCategory)
                      .map(tpl => (
                        <div
                          key={tpl.id}
                          className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] uppercase tracking-wider font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                                {tpl.category}
                              </span>
                              <div className="flex items-center gap-0.5">
                                <button
                                  onClick={() => handleDuplicateTemplate(tpl)}
                                  className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                                  title="შაბლონის დადუბლირება"
                                >
                                  დუბლირება
                                </button>
                                <button
                                  onClick={() => handleEditTemplate(tpl)}
                                  className="p-1 px-1.5 border border-emerald-50 text-emerald-600 hover:bg-emerald-50 rounded text-[11px] font-bold"
                                >
                                  ჩასწორება
                                </button>
                                <button
                                  onClick={() => handleDeleteTemplate(tpl.id)}
                                  className="p-1 text-slate-400 hover:text-red-500 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <h4 className="text-xs font-bold text-slate-800 mt-2">{tpl.name}</h4>
                            <div 
                              className="prose-editor text-[11px] text-slate-500 leading-relaxed mt-2 overflow-y-auto max-h-[140px] pr-1 line-clamp-4"
                              dangerouslySetInnerHTML={{ __html: tpl.content }}
                            />
                          </div>

                          <button
                            onClick={() => {
                              // Fast append into active editor draft
                              handleInsertTemplate(tpl);
                              setCurrentTab('NEW_RECORD');
                            }}
                            className="w-full py-1.5 bg-slate-50 hover:bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-bold border border-slate-100 hover:border-emerald-200 transition"
                          >
                            რეცეპტში გამოყენება
                          </button>

                        </div>
                      ))}
                  </div>

                </div>

              </div>

            </div>
          )}


          {/* =========================================================================
              TAB: SETTINGS (Secure Configuration Panel)
              ========================================================================= */}
          {currentTab === 'SETTINGS' && settings && (
            <div className="space-y-6">
              
              <div>
                <h2 className="text-lg font-bold text-slate-800">პროგრამის პარამეტრები</h2>
                <p className="text-xs text-slate-400">
                  მართეთ ექიმის პირადი პროფილი, კლინიკური გვერდის უსაფრთხოების პაროლი და SMTP ფოსტის პარამეტრები
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Profiles & Security Settings */}
                <form onSubmit={handleSaveSettings} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-50 pb-2">
                    🛡️ კლინიკური პროფილი & უსაფრთხოება
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ექიმის დასახელება და გვარი</label>
                      <input
                        type="text"
                        required
                        value={settings.doctorName}
                        onChange={(e) => setSettings({ ...settings, doctorName: e.target.value })}
                        className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">მობილურის ნომერი</label>
                      <input
                        type="text"
                        required
                        value={settings.doctorPhone}
                        onChange={(e) => setSettings({ ...settings, doctorPhone: e.target.value })}
                        className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ელ-ფოსტა</label>
                      <input
                        type="email"
                        required
                        value={settings.doctorEmail}
                        onChange={(e) => setSettings({ ...settings, doctorEmail: e.target.value })}
                        className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">კლინიკური წვდომის პაროლი</label>
                      <input
                        type="text"
                        required
                        value={settings.doctorPasswordHash}
                        onChange={(e) => setSettings({ ...settings, doctorPasswordHash: e.target.value })}
                        className="w-full h-10 px-3 border border-slate-200 rounded-lg font-mono text-xs outline-none focus:border-emerald-500 transition"
                      />
                      <span className="text-[10px] text-slate-400 block mt-1">ეს პაროლი იცავს პაციენტთა რეესტრს უცხო პირთაგან.</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition"
                  >
                    პროფილის შენახვა
                  </button>
                </form>

                {/* SMTP Email Server config */}
                <form onSubmit={handleSaveSettings} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-50 pb-2">
                    ✉️ SMTP ფოსტის სერვერი (ავტომატური გაგზავნისთვის)
                  </h3>

                  <p className="text-[10px] text-slate-500 leading-normal">
                    მონაცემები გამოიყენება დანიშნულების ფურცლების რეალურად გასაგზავნად. თუ არ გაწერთ, გაგზავნა იმუშავებს უსაფრთხო დემონსტრაციული სიმულაციით.
                  </p>

                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">SMTP ჰოსტი</label>
                        <input
                          type="text"
                          value={settings.smtpHost}
                          onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                          placeholder="smtp.gmail.com"
                          className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">პორტი</label>
                        <input
                          type="number"
                          value={settings.smtpPort || ''}
                          onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) || 587 })}
                          className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">SMTP მომხმარებელი (User / Email)</label>
                      <input
                        type="text"
                        value={settings.smtpUser}
                        onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                        placeholder="giorgi@clinic.ge"
                        className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">SMTP პაროლი / App Password</label>
                      <input
                        type="password"
                        value={settings.smtpPass}
                        onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                        placeholder="••••••••••••••"
                        className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 transition"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="secure_chk"
                        checked={settings.smtpSecure}
                        onChange={(e) => setSettings({ ...settings, smtpSecure: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 border-slate-200 rounded"
                      />
                      <label htmlFor="secure_chk" className="text-xs font-bold text-slate-700 col-span-2">
                        SSL უსაფრთხოება (Secure TLS)
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition"
                  >
                    ფოსტის პარამეტრების შენახვა
                  </button>
                </form>

              </div>

            </div>
          )}

        </main>


        {/* =========================================================================
            EMAIL DISPATCHER MODAL COMPONENT (Preview & Dispatch panel)
            ========================================================================= */}
        {activeEmailRecord && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col justify-between">
              
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">დანიშნულების გაგზავნა ელ-ფოსტაზე</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">პაციენტი: <strong className="text-slate-700">{activeEmailRecord.patient.name}</strong></p>
                </div>
                <button
                  onClick={() => setActiveEmailRecord(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-4 flex-1">
                
                {emailStatus.type && (
                  <div className={`p-3 rounded-lg text-xs font-medium border ${emailStatus.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
                    {emailStatus.message}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ადრესატის ელ-ფოსტა</label>
                  <input
                    type="email"
                    value={activeEmailRecord.patient.email || ''}
                    onChange={(e) => {
                      const updated = { ...activeEmailRecord, patient: { ...activeEmailRecord.patient, email: e.target.value } };
                      setActiveEmailRecord(updated);
                    }}
                    placeholder="პაციენტს ელ-ფოსტა არ აქვს, გთხოვთ ჩაწეროთ..."
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 transition bg-yellow-50/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ფოსტის სათაური (Subject)</label>
                  <input
                    type="text"
                    value={customEmailSubject}
                    onChange={(e) => setCustomEmailSubject(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* PREVIEW NOTICE */}
                <div className="bg-amber-50 border border-amber-100 text-[11px] text-amber-800 p-3 rounded-xl space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    უსაფრთხოების წესი:
                  </p>
                  <p className="leading-relaxed">
                    პაციენტის ელ-ფოსტაზე გაიგზავნება <strong>მხოლოდ დანიშნულება და ექიმის საკონტაქტო</strong>. ჩივილები, ანამნეზი, შიდა შენიშვნები და დიაგნოზი დაცულია და არ მიუვა პაციენტს!
                  </p>
                </div>

                {/* PREVIEW CONTAINER */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 text-center">
                    გასაგზავნი წერილის რეალური ვიზუალი (Preview)
                  </div>
                  
                  <div className="p-5 bg-white text-left text-xs max-h-[220px] overflow-y-auto space-y-3 font-sans">
                    {/* Header */}
                    <div className="border-b-2 border-slate-800 pb-2 mb-2 text-center">
                      <h4 className="text-sm font-bold text-slate-800 leading-none">{settings?.doctorName}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">სამედიცინო დანიშნულების ფურცელი</p>
                    </div>

                    {/* Metadata */}
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                      <p className="my-1"><strong>პაციენტი:</strong> {activeEmailRecord.patient.name}</p>
                      <p className="my-1"><strong>თარიღი:</strong> {activeEmailRecord.patient.visitDate}</p>
                    </div>

                    {/* Prescription HTML format */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                      <p className="font-bold text-slate-800 mb-1">დანიშნულება და რეკომენდაციები:</p>
                      <div 
                        className="prose-editor text-slate-700 leading-relaxed max-w-full text-xs"
                        dangerouslySetInnerHTML={{ __html: activeEmailRecord.prescription }} 
                      />
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-200 pt-2 text-center text-[10px] text-slate-400">
                      <p className="font-bold">პატივისცემით,</p>
                      <p className="font-bold text-slate-700 leading-none mt-1">{settings?.doctorName}</p>
                      <p className="mt-1">ტელ: {settings?.doctorPhone} | {settings?.doctorEmail}</p>
                    </div>

                  </div>
                </div>

              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 rounded-b-2xl">
                <button
                  onClick={() => setActiveEmailRecord(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition whitespace-nowrap cursor-pointer hover:bg-slate-100"
                >
                  გაუქმება
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  {sendingEmail ? 'იგზავნება...' : 'ელ-ფოსტაზე გაგზავნა'}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        )}


        {/* =========================================================================
            BOTTOM NAVIGATION FOR MOBILE CLIENTS (sticky on small viewports)
            ========================================================================= */}
        <div className="md:hidden fixed bottom-1 left-1.5 right-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-xl z-30 py-2.5 flex justify-around">
          
          <button 
            onClick={() => setCurrentTab('DASHBOARD')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${currentTab === 'DASHBOARD' ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            <UserCircle className="w-5 h-5" />
            მთავარი
          </button>

          <button 
            onClick={() => { clearDraft(); setCurrentTab('NEW_RECORD'); }}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${currentTab === 'NEW_RECORD' ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            <Plus className="w-5 h-5" />
            ახალი ვიზიტი
          </button>

          <button 
            onClick={() => setCurrentTab('ARCHIVE')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${currentTab === 'ARCHIVE' ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            <FileText className="w-5 h-5" />
            არქივი
          </button>

          <button 
            onClick={() => setCurrentTab('TEMPLATES')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${currentTab === 'TEMPLATES' ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            <Layers className="w-5 h-5" />
            შაბლონები
          </button>

          <button 
            onClick={() => setCurrentTab('SETTINGS')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${currentTab === 'SETTINGS' ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            <SettingsIcon className="w-5 h-5" />
            სისტემა
          </button>

        </div>

      </div>

    </>
  );
}
