# Hemophilia Factor Management Mobile App
### नेपाल हेमोफिलिया सोसाइटी — केन्द्रीय तथा स्याटेलाइट फ्याक्टर औषधि एवं बिरामी अभिलेख व्यवस्थापन प्रणाली

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FN2047%2Fhemophilia-app&project-name=hemophilia-app&repository-name=hemophilia-app)

---

## १. प्रणालीको परिचय (System Overview)

**Hemophilia Factor Management App** नेपाल हेमोफिलिया सोसाइटी, केन्द्रीय कार्यालय तथा क्षेत्रीय स्याटेलाइटहरूमा हेमोफिलिया र अन्य clotting factor deficiency भएका बिरामीहरूका लागि फ्याक्टर औषधिको स्टक, ब्याच, म्याद (FEFO), बिरामी दर्ता, औषधि वितरण र प्रतिवेदन व्यवस्थापन गर्ने पूर्ण, सुरक्षित र उत्पादन-योग्य (Production-Ready) Full-Stack मोबाइल-मैत्री PWA प्रणाली हो।

---

## २. मुख्य प्रविधिहरू (Technology Stack)

- **Frontend:** React १८, Next.js १४ (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Typography:** Mukta Google Font (स्पष्ट र व्यावसायिक नेपाली अक्षर)
- **Backend & APIs:** Next.js Route Handlers (Edge & Node.js runtime)
- **Validation:** Zod Schema Validation
- **Database & ORM:** Prisma ORM (SQLite सक्रिय स्थानीय परीक्षणका लागि + PostgreSQL उत्पादन वातावरणका लागि पूर्ण DDL माइग्रेसन)
- **प्रमाणीकरण (Auth & Security):** `bcryptjs` (Password Hashing), `jose` (HS256 JWT Signed Session), HTTP-Only Cookies, Role-Based Tenant Isolation
- **Excel Export:** `exceljs` (वास्तविक `.xlsx` निर्माण, CSV Formula Injection सुरक्षा)
- **परीक्षण (Automated Tests):** `vitest` (युनिट तथा इन्टिग्रेशन परीक्षण)
- **PWA:** Web App Manifest, Standalone Mobile UI, Bottom Thumb Navigation

---

## ३. प्रारम्भिक ८ कार्यालयहरू (8 Initial Offices)

प्रणालीमा प्रारम्भिक रूपमा निम्न ८ वटा कार्यालयहरूको छुट्टै डाटा आइसोलेसन उपलब्ध छ:
1. **धनकुटा स्याटेलाइट** (`OFFICE_DHANKUTA`)
2. **उदयपुर स्याटेलाइट** (`OFFICE_UDAYAPUR`)
3. **उर्लाबारी स्याटेलाइट** (`OFFICE_URLABARI`)
4. **झापा स्याटेलाइट** (`OFFICE_JHAPA`)
5. **धरान स्याटेलाइट** (`OFFICE_DHARAN`)
6. **इटहरी स्याटेलाइट** (`OFFICE_ITAHARI`)
7. **ओखलढुङ्गा स्याटेलाइट** (`OFFICE_OKHALDHUNGA`)
8. **विराटनगर अफिस** (`OFFICE_BIRATNAGAR`)

> **नोट:** Super Admin ले कोड परिवर्तन नगरी भविष्यमा जतिसुकै नयाँ कार्यालय थप्न सक्ने सुविधा प्रशासन (Admin Tab) मा उपलब्ध छ।

---

## ४. लगइन खाताहरू (Login Credentials)

प्रणाली परीक्षणका लागि निम्न पूर्व-कन्फिगर गरिएका खाताहरू उपलब्ध छन् (Login UI मा १-क्लिक डेमो छनौट पनि उपलब्ध छ):

| भूमिका (Role) | कार्यालय | प्रयोगकर्ता नाम | पासवर्ड |
| :--- | :--- | :--- | :--- |
| **Super Admin** | केन्द्रीय प्रशासन | `admin` | `Admin@Secure2026!` |
| **Office User** | उर्लाबारी स्याटेलाइट | `urlabari_user` | `Urlabari@2026!` |
| **Office User** | विराटनगर अफिस | `biratnagar_user` | `Biratnagar@2026!` |
| **Office User** | धनकुटा स्याटेलाइट | `dhankuta_user` | `Dhankuta@2026!` |
| **Office User** | धरान स्याटेलाइट | `dharan_user` | `Dharan@2026!` |
| **Office User** | झापा स्याटेलाइट | `jhapa_user` | `Jhapa@2026!` |
| **Office User** | इटहरी स्याटेलाइट | `itahari_user` | `Itahari@2026!` |
| **Office User** | उदयपुर स्याटेलाइट | `udayapur_user` | `Udayapur@2026!` |
| **Office User** | ओखलढुङ्गा स्याटेलाइट | `okhaldhunga_user` | `Okhaldhunga@2026!` |

---

## ५. परियोजना सञ्चालन गर्ने तरिका (Installation & Running)

### १. डिपेन्डेन्सी इन्स्टल:
```bash
npm install
```

### २. डाटाबेस सिङ्क तथा सिड:
```bash
npx prisma db push
node scripts/seed.mjs
```

### ३. स्वचालित परीक्षणहरू चलाउने:
```bash
npm test
```
*(सबै १८ वटा युनिट र इन्टिग्रेशन टेस्टहरू सफल हुनुपर्छ)*

### ४. विकास सर्भर सुरु गर्ने (Local Dev Server):
```bash
npm run dev
```
ब्राउजरमा `http://localhost:3000` खोलेर एप चलाउनुहोस्।

### ५. उत्पादन बिल्ड (Production Build):
```bash
npm run build
npm start
```

---

## ६. मुख्य मोड्युलहरू तथा कार्यप्रणाली

1. **ड्यासबोर्ड (Dashboard):**
   - केन्द्रीय तथा कार्यालय मौज्दातको कुल भाइल र IU छुट्टाछुट्टै प्रदर्शन
   - ९० दिनभित्र म्याद सकिने तथा कम स्टक भएका ब्याचहरूको चेतावनी
   - फ्याक्टर प्रकारअनुसार बाँकी मौज्दात
   - हालसालैका स्टक प्राप्ति तथा वितरण अभिलेख

2. **बिरामी दर्ता (Patient Registration):**
   - Unique Patient ID (`HEP-YYYY-XXXX`) स्वतः उत्पादन
   - नेपालका सातै प्रदेश, जिल्ला, स्थानीय तह र वडा सहितको आधिकारिक Cascading Dropdown
   - जन्ममितिबाट उमेर स्वतः गणना वा अनुमानित उमेर चिन्ह
   - फ्याक्टर प्रतिशत स्तरबाट Severity (Severe, Moderate, Mild, Review Required) को स्वतः वर्गीकरण तथा Clinician Override
   - दोहोरो दर्ता रोकथाम (Duplicate Warning Dialog)

3. **केन्द्रीय स्टक प्राप्ति (Central Stock In):**
   - कम्पनी, उत्पादन, क्षमता (250 - 3000 IU), भाइल संख्या, ब्याच नम्बर र म्याद मिति
   - कुल IU स्वतः गणना (`Capacity × Vials`)

4. **केन्द्रीय स्टक ट्रान्सफर (Central Stock Out):**
   - स्याटेलाइट चयन र उपलब्ध प्रयोगयोग्य ब्याचहरू मात्र Dynamic रूपमा देखिने
   - Multi-Item ट्रान्सफर समर्थन
   - अपर्याप्त स्टक भएमा रोकिने कडा प्रमाणीकरण
   - Atomic Database Transaction: केन्द्रीय स्टक घट्ने र स्याटेलाइट स्टक बढ्ने कार्य एउटै ट्रान्ज्याक्सनमा

5. **बिरामीलाई औषधि वितरण (Patient Factor Distribution):**
   - बिरामीको नाम वा ID बाट खोजी, प्रोफाइलसँग प्रत्यक्ष अन्तरसम्बन्ध
   - कार्यालयको उपलब्ध स्टकबाट मात्र ब्याच चयन
   - रक्तस्राव भएका स्थानहरू (जोर्नी, घुँडा, मांसपेशी, आदि) वा नियमित Prophylaxis / शल्यक्रिया प्रयोजन चयन
   - वितरणपछि तुरुन्तै आधिकारिक रसिद/भौचर (Printable Voucher)

6. **रिपोर्ट तथा Excel Export (.xlsx):**
   - बिरामी सूची, केन्द्रीय स्टक, स्टक ट्रान्सफर, कार्यालय स्टक र वितरण इतिहासको वास्तविक Excel फाइल डाउनलोड
   - Formula Injection (`=`, `+`, `-`, `@`) विरुद्ध सुरक्षित सेल स्यानिटाइजेसन

7. **ब्याकअप तथा पुनःप्राप्ति (Backup & Restore):**
   - `node scripts/backup.mjs` — SHA256 चेकसमसहित ब्याकअप
   - `node scripts/restore.mjs <file>` — प्रमाणीकृत डाटा पुनःप्राप्ति
