import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Ensure data folder exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}

// Initial/default Database schema
const defaultDb = {
  records: [
    {
      id: 'rec_1',
      patient: {
        name: 'ნიკოლოზ კაპანაძე',
        age: '42',
        gender: 'მამრობითი',
        phone: '555 123 456',
        email: 'nikoloz.kapanadze@example.com',
        visitDate: '2026-06-01',
        notes: 'ვიზიტი განმეორებითი, წინა დანიშნულების კორექტირება'
      },
      complaints: 'ტკივილი ეპიგასტრიუმში, გულძმარვა ჭამის შემდეგ, მეტეორიზმი.',
      anamnesis: 'პერიოდული ჩივილები ბოლო 6 თვეა. კვების რეჟიმი დარღვეულია, იღებს ცხარე და ყავისფერ პროდუქტებს ხშირად.',
      diagnosis: 'გასტროეზოფაგური რეფლუქსური დაავადება (GERD), ქრონიკული გასტრიტი.',
      prescription: `<h3><strong>მედიკამენტოზური თერაპია:</strong></h3>
<ol>
  <li><strong>ომეპრაზოლი 20მგ</strong> - 1 კაფსულა დილით უზმოზე, ჭამამდე 30 წუთით ადრე, 14 დღე.</li>
  <li><strong>ალმაგელი ნეო</strong> - 1 საზომი კოვზი ჭამიდან 1 საათის შემდეგ და ძილის წინ, 10 დღე.</li>
  <li><strong>პანკრეატინი 10000 ედ</strong> - 1 ტაბლეტი ჭამის დროს, 10 დღე.</li>
</ol>
<h3><strong>რეკომენდაციები:</strong></h3>
<ul>
  <li>მიიღეთ საკვები მცირე ულუფებით, ხშირად (5-ჯერ დღეში).</li>
  <li>მოერიდეთ ცხარე, მლაშე, მჟავე საკვებს და გაზიან სასმელებს.</li>
  <li>საკვების მიღებიდან 2 საათის განმავლობაში ნუ დაწვებით.</li>
</ul>`,
      doctorNotes: 'პაციენტი იცავს დიეტას ნაწილობრივ. დაგეგმილია მუცლის ღრუს ექოსკოპია.',
      createdAt: '2026-06-01T10:00:00Z',
      updatedAt: '2026-06-01T10:30:00Z'
    },
    {
      id: 'rec_2',
      patient: {
        name: 'მარიამ შენგელია',
        age: '29',
        gender: 'მდედრობითი',
        phone: '577 987 654',
        email: 'mariam.sh@example.com',
        visitDate: '2026-06-03',
        notes: 'პირველადი ვიზიტი'
      },
      complaints: 'ყელის ტკივილი, მშრალი ხველა, სუბფებრილური ტემპერატურა 37.4 °C.',
      anamnesis: 'დაავადდა მწვავედ 2 დღის წინ გადაციების შემდეგ.',
      diagnosis: 'მწვავე ფარინგიტი (Pharyngitis acuta).',
      prescription: `<h3><strong>მკურნალობის სქემა:</strong></h3>
<ol>
  <li><strong>დეკატილენი</strong> - 1 ტაბლეტი გასაწუწნად ყოველ 3-4 საათში ერთხელ (მაქსიმუმ 6-8 დღეში).</li>
  <li><strong>ამბროქსოლი 30მგ</strong> - 1 ტაბლეტი 3-ჯერ დღეში, ჭამის შემდეგ, 5 დღე (ხველის გასაუმჯობესებლად).</li>
  <li><strong>მარილიანი წყლის სავლები</strong> - ყელში გამოსავლებლად 4-5-ჯერ დღეში.</li>
</ol>
<h3><strong>ზოგადი რეჟიმი:</strong></h3>
<ul>
  <li>თბილი სითხეების უხვი მიღება (ჩაი, თბილი რძე თაფლით).</li>
  <li>მოერიდეთ ძალზედ ცხელ, ცივ ან მყარ საკვებს.</li>
</ul>`,
      doctorNotes: 'კარდიალური ჩივილები არ აღენიშნება. ფილტვები სუფთაა.',
      createdAt: '2026-06-03T11:20:00Z',
      updatedAt: '2026-06-03T11:45:00Z'
    }
  ],
  templates: [
    {
      id: 'tpl_1',
      name: 'ანტიბიოტიკის სქემა (კლინდამიცინი)',
      category: 'მედიკამენტები',
      content: `<h4><strong>ანტიბაქტერიული თერაპია:</strong></h4>
<ul>
  <li><strong>კლინდამიცინი 300მგ</strong> - 1 კაფსულა 3-ჯერ დღეში, ჭამის შემდეგ, 7 დღის განმავლობაში.</li>
  <li><strong>პრობიოტიკი (მაგ: ლაქტოჯი)</strong> - 1 კაფსულა დღეში ერთხელ, ანტიბიოტიკის მიღებიდან 2 საათის შემდეგ, 10 დღე.</li>
</ul>`
    },
    {
      id: 'tpl_2',
      name: 'გასტრიტის დიეტა და რეჟიმი',
      category: 'რეკომენდაციები',
      content: `<h4><strong>რეკომენდაციები გასტრიტის დროს:</strong></h4>
<ul>
  <li>საკვები მიიღეთ დღეში 4-5-ჯერ, მცირე პორციებით, ერთსა და იმავე დროს.</li>
  <li><strong>აკრძალული პროდუქტები:</strong> ალკოჰოლი, მჟავე, უხეში ბოჭკოვანი საკვები, ყავა, შემწვარი, ცხარე, ნიორი, ლიმონი, ტომატი, გაზიანი სასმელები.</li>
  <li><strong>რეკომენდებული პროდუქტები:</strong> მოხარშული ან ორთქლზე მომზადებული თევზი, ქათმის ფილე, ბურღულეული (ოვსიანკა, ბრინჯი), კარტოფილის პიურე.</li>
</ul>`
    },
    {
      id: 'tpl_3',
      name: 'კარდიოლოგიური ანალიზები',
      category: 'კვლევები',
      content: `<h4><strong>სარეკომენდაციო ლაბორატორიულ-ინსტრუმენტული კვლევები:</strong></h4>
<ol>
  <li>სისხლის საერთო ანალიზი (CBC) + ერითროციტების დანალექის სიჩქარე (ედსი).</li>
  <li>ლიპიდური სპექტრი (ქოლესტერინი, ტრიგლიცერიდები, HDL, LDL).</li>
  <li>კოაგულოგრამა (PT, INR, APTT).</li>
  <li>ელექტროკარდიოგრამა (ეკგ) 12 განხრით.</li>
  <li>ექოკარდიოგრაფია (გულის ულტრაბგერითი გამოკვლევა).</li>
</ol>`
    },
    {
      id: 'tpl_4',
      name: 'განმეორებითი ვიზიტი დინამიკაში',
      category: 'კონტროლი / განმეორებითი ვიზიტი',
      content: `<h4><strong>მკურნალობის მონიტორინგი და კონტროლი:</strong></h4>
<p>გთხოვთ, გამოცხადდეთ განმეორებით კონსულტაციაზე <strong>10-14 დღის განმავლობაში</strong> მკურნალობის ეფექტურობის შესაფასებლად და ჩატარებული კვლევების პასუხების განსახილველად.</p>
<p><em>მდგომარეობის მოულოდნელი გაუარესების შემთხვევაში, დაუყოვნებლივ დაუკავშირდით მკურნალ ექიმს ან მიმართეთ გადაუდებელი დახმარების ცენტრს.</em></p>`
    },
    {
      id: 'tpl_5',
      name: 'ზოგადი გაჯანსაღების რეკომენდაციები',
      category: 'ზოგადი დანიშნულება',
      content: `<h4><strong>ჯანსაღი ცხოვრების წესის რეკომენდაციები:</strong></h4>
<ul>
  <li>ფიზიკური აქტივობა: კვირაში მინიმუმ 150 წუთი ზომიერი აერობული დატვირთვა (სწრაფი სიარული, ცურვა).</li>
  <li>ძილის ჰიგიენა: უზრუნველყავით 7-8 საათიანი უწყვეტი ძილი. მოერიდეთ ეკრანებს ძილის წინ 1 საათით ადრე.</li>
  <li>წყლის ბალანსი: მიიღეთ 1.5 - 2 ლიტრი სუფთა წყალი დღის განმავლობაში.</li>
</ul>`
    }
  ],
  settings: {
    doctorName: 'ექიმი გიორგი იმედაშვილი',
    doctorPhone: '591 401 506',
    doctorEmail: 'gimedashvili7@gmail.com',
    doctorPasswordHash: 'giorgi591', // Standard plain text or simple comparison hash
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpSecure: false
  }
};

// Global helper to read/write DB
function getDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, resetting...', err);
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }
}

function saveDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

app.use(express.json({ limit: '10mb' }));

// AUTH ENDPOINTS
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  const db = getDb();
  if (password === db.settings.doctorPasswordHash) {
    res.json({ success: true, doctor: { name: db.settings.doctorName, email: db.settings.doctorEmail, phone: db.settings.doctorPhone } });
  } else {
    res.status(401).json({ success: false, message: 'არასწორი პაროლი! გთხოვთ სცადოთ ხელახლა.' });
  }
});

app.post('/api/auth/verify', (req, res) => {
  const { password } = req.body;
  const db = getDb();
  if (password === db.settings.doctorPasswordHash) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

// RECORDS ENDPOINTS
app.get('/api/records', (req, res) => {
  const db = getDb();
  // Sort records descending by visit date or creation
  const sorted = [...db.records].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(sorted);
});

app.post('/api/records', (req, res) => {
  const db = getDb();
  const record = {
    ...req.body,
    id: 'rec_' + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.records.push(record);
  saveDb(db);
  res.status(201).json(record);
});

app.put('/api/records/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const idx = db.records.findIndex((r: any) => r.id === id);
  if (idx !== -1) {
    const updatedRecord = {
      ...db.records[idx],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    db.records[idx] = updatedRecord;
    saveDb(db);
    res.json(updatedRecord);
  } else {
    res.status(404).json({ message: 'ჩანაწერი ვერ მოიძებნა' });
  }
});

app.delete('/api/records/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const filtered = db.records.filter((r: any) => r.id !== id);
  db.records = filtered;
  saveDb(db);
  res.json({ success: true, message: 'წარმატებით წაიშალა' });
});

// TEMPLATES ENDPOINTS
app.get('/api/templates', (req, res) => {
  const db = getDb();
  res.json(db.templates);
});

app.post('/api/templates', (req, res) => {
  const db = getDb();
  const template = {
    ...req.body,
    id: 'tpl_' + Math.random().toString(36).substr(2, 9)
  };
  db.templates.push(template);
  saveDb(db);
  res.status(201).json(template);
});

app.put('/api/templates/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const idx = db.templates.findIndex((t: any) => t.id === id);
  if (idx !== -1) {
    db.templates[idx] = { ...db.templates[idx], ...req.body };
    saveDb(db);
    res.json(db.templates[idx]);
  } else {
    res.status(404).json({ message: 'შაბლონი ვერ მოიძებნა' });
  }
});

app.delete('/api/templates/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  db.templates = db.templates.filter((t: any) => t.id !== id);
  saveDb(db);
  res.json({ success: true });
});

// SETTINGS ENDPOINTS
app.get('/api/settings', (req, res) => {
  const db = getDb();
  // Don't send mail server passwords to client unnecessarily unless required for configuration
  const s = { ...db.settings };
  res.json(s);
});

app.put('/api/settings', (req, res) => {
  const db = getDb();
  db.settings = {
    ...db.settings,
    ...req.body
  };
  saveDb(db);
  res.json(db.settings);
});

// EMAIL SENDING SERVICE
app.post('/api/send-email', async (req, res) => {
  const { to, subject, emailBody, patientName, visitDate, prescriptionHtml, includeDiagnostics } = req.body;
  const db = getDb();
  const settings = db.settings;

  // Let's create an elegant, professional medical prescription HTML body
  const finalHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1.5px solid #cbd5e1; border-radius: 8px; background-color: #ffffff; color: #1e293b;">
      <!-- Header -->
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; text-align: center;">
        <h2 style="color: #0f172a; margin: 0 0 5px 0; font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">სამედიცინო დანიშნულება</h2>
        <p style="margin: 0; color: #64748b; font-size: 12px; font-style: italic;">სამედიცინო ჩანაწერი და რეცეპტი</p>
      </div>

      <!-- Doctor Info -->
      <div style="background-color: #f8fafc; border-radius: 6px; padding: 15px; margin-bottom: 25px; font-size: 13px; border: 1px solid #e2e8f0;">
        <strong style="font-size: 14px; color: #0f172a; display: block; margin-bottom: 6px;">ექიმის საკონტაქტო ინფორმაცია:</strong>
        <p style="margin: 3px 0;"><strong>ექიმი:</strong> ${settings.doctorName}</p>
        <p style="margin: 3px 0;"><strong>მობილური:</strong> ${settings.doctorPhone}</p>
        <p style="margin: 3px 0;"><strong>ელ.ფოსტა:</strong> <a href="mailto:${settings.doctorEmail}" style="color: #2563eb; text-decoration: none;">${settings.doctorEmail}</a></p>
      </div>

      <!-- Patient / Visit Info -->
      <div style="margin-bottom: 25px; font-size: 13px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; color: #334155;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 3px 0; width: 120px; font-weight: bold;">პაციენტი:</td>
            <td style="padding: 3px 0;">${patientName}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0; font-weight: bold;">ვიზიტის თარიღი:</td>
            <td style="padding: 3px 0;">${visitDate}</td>
          </tr>
        </table>
      </div>

      <!-- Rich Prescription Content -->
      <div style="margin-bottom: 30px; font-size: 14px; line-height: 1.6; color: #0f172a; min-height: 150px; background-color: #ffffff; padding: 20px; border-radius: 6px; border: 1px solid #cbd5e1;">
        <h3 style="color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-top: 0; font-size: 16px; font-weight: bold;">დანიშნულება და რეკომენდაციები</h3>
        <div style="margin-top: 15px;">
          ${prescriptionHtml}
        </div>
      </div>

      <!-- Compliance Statement -->
      <div style="margin-bottom: 25px; padding: 10px 15px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 11px; color: #475569; text-align: center;">
         გთხოვთ, ზუსტად დაიცვათ დანიშნულება და მკურნალობის რეჟიმი.
      </div>

      <!-- Professional Footer -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.4;">
        <p style="margin: 0; font-weight: bold;">პატივისცემით,</p>
        <p style="margin: 3px 0 10px 0; font-size: 13px; font-weight: bold; color: #0f172a;">${settings.doctorName}</p>
        <p style="margin: 2px 0;">ტელეფონი: ${settings.doctorPhone} | ელ.ფოსტა: ${settings.doctorEmail}</p>
        <p style="margin: 15px 0 0 0; font-size: 9px; color: #94a3b8; border-top: 1px dashed #e2e8f0; padding-top: 10px;">
          ეს ელ-ფოსტა და მისი შიგთავსი არის კონფიდენციალური და განკუთვნილია მხოლოდ ადრესატისთვის.
        </p>
      </div>
    </div>
  `;

  // Check if SMTP is configured. If not, fallback/simulation is used
  if (!settings.smtpUser || !settings.smtpHost || !settings.smtpPass) {
    console.log(`[SMTP Not Configured] Simulating email sending to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body Details:\n${emailBody}`);
    // Successful simulation response
    return res.json({
      success: true,
      simulated: true,
      message: 'სიმულაცია: ელ-ფოსტა წარმატებით გაიგზავნა! (რადგან პარამეტრებში SMTP სერვერი არ არის დაყენებული, გაგზავნა მოხდა დაცული რეჟიმის სიმულაციით. SMTP-ის კონფიგურირება შეგიძლიათ პარამეტრების გვერდიდან).'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"${settings.doctorName}" <${settings.smtpUser}>`,
      to,
      subject,
      text: emailBody || `მოგესალმებით, გიგზავნით თქვენს სამედიცინო დანიშნულებას ექიმ ${settings.doctorName}-სგან.`,
      html: finalHtml
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully: ', info.messageId);
    res.json({ success: true, message: 'ელ-ფოსტა წარმატებით გაეგზავნა პაციენტს!' });
  } catch (error: any) {
    console.error('Nodemailer error: ', error);
    res.status(500).json({
      success: false,
      message: `ელ-ფოსტის გაგზავნა ვერ მოხერხდა: ${error.message || error}. გთხოვთ, შეამოწმოთ SMTP პარამეტრები.`
    });
  }
});

// Serve Vite dev server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
