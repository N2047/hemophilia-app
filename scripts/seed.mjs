import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Hemophilia Factor Management Database...');

  // 1. Initial 8 Offices
  const offices = [
    { id: 'OFFICE_DHANKUTA', nameNepali: 'धनकुटा स्याटेलाइट', nameEnglish: 'Dhankuta Satellite', district: 'धनकुटा', isCentral: false },
    { id: 'OFFICE_UDAYAPUR', nameNepali: 'उदयपुर स्याटेलाइट', nameEnglish: 'Udayapur Satellite', district: 'उदयपुर', isCentral: false },
    { id: 'OFFICE_URLABARI', nameNepali: 'उर्लाबारी स्याटेलाइट', nameEnglish: 'Urlabari Satellite', district: 'मोरङ', isCentral: false },
    { id: 'OFFICE_JHAPA', nameNepali: 'झापा स्याटेलाइट', nameEnglish: 'Jhapa Satellite', district: 'झापा', isCentral: false },
    { id: 'OFFICE_DHARAN', nameNepali: 'धरान स्याटेलाइट', nameEnglish: 'Dharan Satellite', district: 'सुनसरी', isCentral: false },
    { id: 'OFFICE_ITAHARI', nameNepali: 'इटहरी स्याटेलाइट', nameEnglish: 'Itahari Satellite', district: 'सुनसरी', isCentral: false },
    { id: 'OFFICE_OKHALDHUNGA', nameNepali: 'ओखलढुङ्गा स्याटेलाइट', nameEnglish: 'Okhaldhunga Satellite', district: 'ओखलढुङ्गा', isCentral: false },
    { id: 'OFFICE_BIRATNAGAR', nameNepali: 'विराटनगर अफिस', nameEnglish: 'Biratnagar Office', district: 'मोरङ', isCentral: false },
  ];

  for (const office of offices) {
    await prisma.office.upsert({
      where: { id: office.id },
      update: { nameNepali: office.nameNepali, nameEnglish: office.nameEnglish, district: office.district },
      create: office,
    });
  }
  console.log('✅ 8 Offices initialized.');

  // 2. Initial Users
  const adminPasswordHash = await bcrypt.hash('Admin@Secure2026!', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash: adminPasswordHash, role: 'SUPER_ADMIN', isActive: true },
    create: {
      username: 'admin',
      name: 'केन्द्रीय प्रशासक (Super Admin)',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  const officeUsers = [
    { username: 'dhankuta_user', name: 'धनकुटा कार्यालय प्रतिनिधि', officeId: 'OFFICE_DHANKUTA', pass: 'Dhankuta@2026!' },
    { username: 'udayapur_user', name: 'उदयपुर कार्यालय प्रतिनिधि', officeId: 'OFFICE_UDAYAPUR', pass: 'Udayapur@2026!' },
    { username: 'urlabari_user', name: 'उर्लाबारी कार्यालय प्रतिनिधि', officeId: 'OFFICE_URLABARI', pass: 'Urlabari@2026!' },
    { username: 'jhapa_user', name: 'झापा कार्यालय प्रतिनिधि', officeId: 'OFFICE_JHAPA', pass: 'Jhapa@2026!' },
    { username: 'dharan_user', name: 'धरान कार्यालय प्रतिनिधि', officeId: 'OFFICE_DHARAN', pass: 'Dharan@2026!' },
    { username: 'itahari_user', name: 'इटहरी कार्यालय प्रतिनिधि', officeId: 'OFFICE_ITAHARI', pass: 'Itahari@2026!' },
    { username: 'okhaldhunga_user', name: 'ओखलढुङ्गा कार्यालय प्रतिनिधि', officeId: 'OFFICE_OKHALDHUNGA', pass: 'Okhaldhunga@2026!' },
    { username: 'biratnagar_user', name: 'विराटनगर कार्यालय प्रतिनिधि', officeId: 'OFFICE_BIRATNAGAR', pass: 'Biratnagar@2026!' },
  ];

  for (const u of officeUsers) {
    const pHash = await bcrypt.hash(u.pass, 10);
    await prisma.user.upsert({
      where: { username: u.username },
      update: { passwordHash: pHash, name: u.name, officeId: u.officeId, role: 'OFFICE_USER', isActive: true },
      create: {
        username: u.username,
        name: u.name,
        passwordHash: pHash,
        role: 'OFFICE_USER',
        officeId: u.officeId,
        isActive: true,
      },
    });
  }
  console.log('✅ Super Admin & 8 Satellite Users created.');

  // 3. Master Capacities
  const capacities = [
    { capacityIu: 250, label: '250 IU' },
    { capacityIu: 500, label: '500 IU' },
    { capacityIu: 750, label: '750 IU' },
    { capacityIu: 1000, label: '1000 IU' },
    { capacityIu: 1500, label: '1500 IU' },
    { capacityIu: 2000, label: '2000 IU' },
    { capacityIu: 3000, label: '3000 IU' },
  ];
  for (const cap of capacities) {
    await prisma.productCapacity.upsert({
      where: { capacityIu: cap.capacityIu },
      update: { label: cap.label },
      create: cap,
    });
  }
  console.log('✅ Capacities created.');

  // 4. Master Companies & Products
  const companiesData = [
    {
      name: 'Takeda (Shire/Baxalta)',
      products: [
        { name: 'Advate', factorType: 'Factor VIII' },
        { name: 'Rixubis', factorType: 'Factor IX' },
        { name: 'Feiba', factorType: 'Other' },
      ],
    },
    {
      name: 'Novo Nordisk',
      products: [
        { name: 'NovoSeven RT', factorType: 'Factor VII' },
        { name: 'NovoEight', factorType: 'Factor VIII' },
        { name: 'NovoNine', factorType: 'Factor IX' },
        { name: 'Novo 7', factorType: 'Factor VII' },
      ],
    },
    {
      name: 'CSL Behring',
      products: [
        { name: 'Helixate FS', factorType: 'Factor VIII' },
        { name: 'Idelvion', factorType: 'Factor IX' },
        { name: 'Factor VIII (CSL)', factorType: 'Factor VIII' },
        { name: 'Factor IX (CSL)', factorType: 'Factor IX' },
      ],
    },
    {
      name: 'Octapharma',
      products: [
        { name: 'Octanate', factorType: 'Factor VIII' },
        { name: 'Octanine F', factorType: 'Factor IX' },
        { name: 'Wilate', factorType: 'Other' },
      ],
    },
    {
      name: 'Pfizer',
      products: [
        { name: 'BeneFIX', factorType: 'Factor IX' },
        { name: 'Xyntha', factorType: 'Factor VIII' },
      ],
    },
    {
      name: 'CIBA',
      products: [
        { name: 'CIBA Factor VIII', factorType: 'Factor VIII' },
        { name: 'CIBA Factor IX', factorType: 'Factor IX' },
      ],
    },
    {
      name: 'Grifols',
      products: [
        { name: 'Alphanate', factorType: 'Factor VIII' },
        { name: 'AlphaNine SD', factorType: 'Factor IX' },
      ],
    },
    {
      name: 'Roche / Chugai',
      products: [
        { name: 'Hemlibra (Emicizumab)', factorType: 'Other' },
      ],
    },
  ];

  for (const comp of companiesData) {
    const c = await prisma.company.upsert({
      where: { name: comp.name },
      update: {},
      create: { name: comp.name },
    });

    for (const prod of comp.products) {
      await prisma.product.upsert({
        where: {
          companyId_name_factorType: {
            companyId: c.id,
            name: prod.name,
            factorType: prod.factorType,
          },
        },
        update: {},
        create: {
          companyId: c.id,
          name: prod.name,
          factorType: prod.factorType,
        },
      });
    }
  }
  console.log('✅ Companies and Products seeded.');

  // 5. Distribution Purposes (नेपाली + English)
  const purposes = [
    // Bleed Sites (रक्तस्राव भएको स्थान)
    { category: 'BLEED_SITE', nameNepali: 'जोर्नीमा रक्तस्राव (सामान्य)', nameEnglish: 'Joint Bleed (General)', sortOrder: 1 },
    { category: 'BLEED_SITE', nameNepali: 'घुँडाको जोर्नीमा रक्तस्राव', nameEnglish: 'Knee Joint Bleed (Hemarthrosis)', sortOrder: 2 },
    { category: 'BLEED_SITE', nameNepali: 'कुहिनाको जोर्नीमा रक्तस्राव', nameEnglish: 'Elbow Joint Bleed', sortOrder: 3 },
    { category: 'BLEED_SITE', nameNepali: 'गोलीगाँठोको जोर्नीमा रक्तस्राव', nameEnglish: 'Ankle Joint Bleed', sortOrder: 4 },
    { category: 'BLEED_SITE', nameNepali: 'काँध वा नाडीको जोर्नीमा रक्तस्राव', nameEnglish: 'Shoulder / Wrist Joint Bleed', sortOrder: 5 },
    { category: 'BLEED_SITE', nameNepali: 'मांसपेशीमा रक्तस्राव', nameEnglish: 'Muscle Bleed (Hematoma)', sortOrder: 6 },
    { category: 'BLEED_SITE', nameNepali: 'छाला वा नरम तन्तुमा रक्तस्राव', nameEnglish: 'Subcutaneous / Soft Tissue Bleed', sortOrder: 7 },
    { category: 'BLEED_SITE', nameNepali: 'नाकबाट रक्तस्राव', nameEnglish: 'Epistaxis (Nose Bleed)', sortOrder: 8 },
    { category: 'BLEED_SITE', nameNepali: 'मुख वा गिजाबाट रक्तस्राव', nameEnglish: 'Oral / Gum Bleed', sortOrder: 9 },
    { category: 'BLEED_SITE', nameNepali: 'दाँत उपचार (Dental Procedure)', nameEnglish: 'Dental Procedure Bleed / Prophylaxis', sortOrder: 10 },
    { category: 'BLEED_SITE', nameNepali: 'चोटपटक वा दुर्घटना (Trauma/Accident)', nameEnglish: 'Trauma / Injury Management', sortOrder: 11 },
    { category: 'BLEED_SITE', nameNepali: 'पिसाबमा रगत', nameEnglish: 'Hematuria (Urinary Bleed)', sortOrder: 12 },
    { category: 'BLEED_SITE', nameNepali: 'दिसामा रगत वा पेट–आन्द्राभित्र रक्तस्राव', nameEnglish: 'Gastrointestinal Bleed (GI Bleed)', sortOrder: 13 },
    { category: 'BLEED_SITE', nameNepali: 'टाउको वा मस्तिष्कभित्र रक्तस्राव', nameEnglish: 'Intracranial Hemorrhage (Emergency)', sortOrder: 14 },
    { category: 'BLEED_SITE', nameNepali: 'घाँटीमा रक्तस्राव', nameEnglish: 'Neck / Throat Bleed (Emergency)', sortOrder: 15 },
    { category: 'BLEED_SITE', nameNepali: 'अन्य स्थानमा रक्तस्राव', nameEnglish: 'Other Bleed Site', sortOrder: 16 },

    // Non-Bleed Purposes (रक्तस्रावबाहेकका प्रयोजन)
    { category: 'NON_BLEED', nameNepali: 'आवश्यकता अनुसार (अनडिमान्ड / On-demand)', nameEnglish: 'On-demand Treatment', sortOrder: 17 },
    { category: 'NON_BLEED', nameNepali: 'नियमित रोकथाम (Prophylaxis)', nameEnglish: 'Regular Prophylaxis', sortOrder: 18 },
    { category: 'NON_BLEED', nameNepali: 'शल्यक्रियाअघि (Pre-surgery)', nameEnglish: 'Pre-surgery Preparation', sortOrder: 19 },
    { category: 'NON_BLEED', nameNepali: 'शल्यक्रियापछि (Post-surgery)', nameEnglish: 'Post-surgery Management', sortOrder: 20 },
  ];

  for (const p of purposes) {
    const existing = await prisma.distributionPurposeMaster.findFirst({
      where: { nameNepali: p.nameNepali },
    });
    if (!existing) {
      await prisma.distributionPurposeMaster.create({ data: p });
    }
  }
  console.log('✅ Distribution Purposes initialized.');

  // 6. System Settings
  const settings = [
    { key: 'APP_NAME', value: 'Hemophilia Factor Management App' },
    { key: 'LOW_STOCK_THRESHOLD', value: '10' },
    { key: 'EXPIRY_ALERT_DAYS', value: '90' },
    { key: 'ORGANIZATION_NAME', value: 'Nepal Hemophilia Society' },
  ];
  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
