import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  generateExcelWorkbook,
  generateMultiSheetWorkbook,
  ExcelColumnDef,
  ExcelSheetDef,
} from '@/lib/excelExport';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'अनधिकृत पहुँच' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'master';
    const reqOfficeId = searchParams.get('officeId');

    let officeIdFilter: string | undefined = undefined;
    if (user.role === 'OFFICE_USER') {
      officeIdFilter = user.officeId || undefined;
    } else if (reqOfficeId) {
      officeIdFilter = reqOfficeId;
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);

    const offices = await prisma.office.findMany();
    const officeMap = Object.fromEntries(offices.map((o) => [o.id, o.nameNepali]));

    // =========================================================================
    // CASE 1: MASTER CONSOLIDATED REPORT WITH ALL 4 WORKSHEETS
    // =========================================================================
    if (type === 'master') {
      // -------------------------------------------------------------
      // SHEET 1: हेमोफिलिया बिरामीको प्रारम्भिक अभिलेखीकरण (Patient Registry)
      // -------------------------------------------------------------
      const patientWhere: any = { isActive: true };
      if (officeIdFilter) patientWhere.registeredOfficeId = officeIdFilter;

      const patients = await prisma.patient.findMany({
        where: patientWhere,
        orderBy: { createdAt: 'asc' },
      });

      const sheet1Cols: ExcelColumnDef[] = [
        { header: 'क्र.सं.', key: 'sn', width: 8 },
        { header: 'Patient ID', key: 'code', width: 16 },
        { header: 'बिरामीको पूरा नाम', key: 'name', width: 24 },
        { header: 'उमेर', key: 'age', width: 10 },
        { header: 'लिङ्ग', key: 'gender', width: 10 },
        { header: 'रक्त समूह', key: 'bloodGroup', width: 12 },
        { header: 'फोन नम्बर', key: 'phone', width: 16 },
        { header: 'प्रदेश', key: 'province', width: 22 },
        { header: 'जिल्ला', key: 'district', width: 16 },
        { header: 'स्थानीय तह', key: 'localLevel', width: 22 },
        { header: 'वडा नं.', key: 'ward', width: 10 },
        { header: 'टोल ठेगाना', key: 'tole', width: 18 },
        { header: 'फ्याक्टर प्रकार', key: 'factorType', width: 16 },
        { header: 'फ्याक्टर स्तर (%)', key: 'factorLevel', width: 16 },
        { header: 'गम्भीरता (Severity)', key: 'severity', width: 18 },
        { header: 'दर्ता मिति', key: 'regDate', width: 14 },
        { header: 'दर्ता कार्यालय', key: 'office', width: 22 },
      ];

      const sheet1Rows = patients.map((p, idx) => ({
        sn: idx + 1,
        code: p.patientCode,
        name: p.fullName,
        age: p.age,
        gender: p.gender || 'पुरुष',
        bloodGroup: p.bloodGroup,
        phone: p.phone,
        province: p.province,
        district: p.district,
        localLevel: p.localLevel,
        ward: p.wardNo,
        tole: p.toleAddress || '-',
        factorType: p.factorType,
        factorLevel: p.factorLevelPercent != null ? `${p.factorLevelPercent}%` : 'अज्ञात',
        severity: p.severity,
        regDate: p.createdAt ? p.createdAt.toISOString().slice(0, 10) : '-',
        office: officeMap[p.registeredOfficeId] || p.registeredOfficeId,
      }));

      // -------------------------------------------------------------
      // SHEET 2: फ्याक्टरको स्टकको अवस्था - वर्तमान स्टक (Central Stock Status)
      // -------------------------------------------------------------
      const centralBatches = await prisma.centralStockBatch.findMany({
        include: { company: true, product: true },
        orderBy: { expiryDate: 'asc' },
      });

      const sheet2Cols: ExcelColumnDef[] = [
        { header: 'क्र.सं.', key: 'sn', width: 8 },
        { header: 'उत्पादक कम्पनी', key: 'company', width: 22 },
        { header: 'उत्पादन / ब्रान्ड', key: 'product', width: 20 },
        { header: 'फ्याक्टर प्रकार', key: 'factorType', width: 16 },
        { header: 'भाइल क्षमता (IU)', key: 'capacity', width: 16 },
        { header: 'ब्याच नम्बर', key: 'batch', width: 18 },
        { header: 'म्याद सकिने मिति', key: 'expiry', width: 16 },
        { header: 'कुल प्राप्त भाइल', key: 'received', width: 16 },
        { header: 'पठाइएको भाइल', key: 'transferred', width: 16 },
        { header: 'हाल बाँकी भाइल', key: 'current', width: 16 },
        { header: 'हाल बाँकी IU', key: 'totalIu', width: 18 },
        { header: 'अवस्था / स्थिति', key: 'status', width: 16 },
      ];

      const sheet2Rows = centralBatches.map((b, idx) => ({
        sn: idx + 1,
        company: b.company.name,
        product: b.product.name,
        factorType: b.product.factorType,
        capacity: b.capacityIu,
        batch: b.batchNumber,
        expiry: b.expiryDate.toISOString().slice(0, 10),
        received: b.receivedVials,
        transferred: b.transferredVials,
        current: b.currentVials,
        totalIu: b.currentVials * b.capacityIu,
        status: b.isQuarantined || b.expiryDate <= now ? 'म्याद समाप्त' : 'प्रयोगयोग्य',
      }));

      // -------------------------------------------------------------
      // SHEET 3: स्याटेलाइट स्टक (कुन स्याटेलाइटमा के कति औषधि छ)
      // -------------------------------------------------------------
      const officeBatchWhere: any = {};
      if (officeIdFilter) officeBatchWhere.officeId = officeIdFilter;

      const officeBatches = await prisma.officeStockBatch.findMany({
        where: officeBatchWhere,
        include: { office: true, company: true, product: true },
        orderBy: [{ officeId: 'asc' }, { expiryDate: 'asc' }],
      });

      const sheet3Cols: ExcelColumnDef[] = [
        { header: 'क्र.सं.', key: 'sn', width: 8 },
        { header: 'स्याटेलाइट / कार्यालय', key: 'office', width: 22 },
        { header: 'जिल्ला', key: 'district', width: 16 },
        { header: 'कम्पनी', key: 'company', width: 20 },
        { header: 'उत्पादन', key: 'product', width: 18 },
        { header: 'फ्याक्टर प्रकार', key: 'factorType', width: 16 },
        { header: 'क्षमता (IU)', key: 'capacity', width: 14 },
        { header: 'ब्याच नम्बर', key: 'batch', width: 18 },
        { header: 'म्याद मिति', key: 'expiry', width: 14 },
        { header: 'प्राप्त भाइल', key: 'received', width: 14 },
        { header: 'वितरित भाइल', key: 'distributed', width: 14 },
        { header: 'हाल बाँकी भाइल', key: 'current', width: 14 },
        { header: 'हाल बाँकी IU', key: 'totalIu', width: 16 },
        { header: 'स्थिति', key: 'status', width: 14 },
      ];

      const sheet3Rows = officeBatches.map((b, idx) => ({
        sn: idx + 1,
        office: b.office.nameNepali,
        district: b.office.district,
        company: b.company.name,
        product: b.product.name,
        factorType: b.product.factorType,
        capacity: b.capacityIu,
        batch: b.batchNumber,
        expiry: b.expiryDate.toISOString().slice(0, 10),
        received: b.receivedVials,
        distributed: b.distributedVials,
        current: b.currentVials,
        totalIu: b.currentVials * b.capacityIu,
        status: b.isQuarantined || b.expiryDate <= now ? 'म्याद समाप्त' : 'प्रयोगयोग्य',
      }));

      // -------------------------------------------------------------
      // SHEET 4: बिरामीले औषधि प्रयोग गरेको विस्तृत रिपोर्ट (Patient Factor Dispensation)
      // -------------------------------------------------------------
      const distWhere: any = {};
      if (officeIdFilter) distWhere.officeId = officeIdFilter;

      const distributions = await prisma.patientDistribution.findMany({
        where: distWhere,
        include: {
          patient: true,
          office: true,
          dispensedBy: true,
          items: true,
        },
      });

      // Sort by Patient Name ascending, then by distribution date ascending
      // so each patient's full medical history and factor usage over time is grouped together
      distributions.sort((a, b) => {
        const nameComp = a.patient.fullName.localeCompare(b.patient.fullName);
        if (nameComp !== 0) return nameComp;
        return new Date(a.distributionDate).getTime() - new Date(b.distributionDate).getTime();
      });

      const sheet4Cols: ExcelColumnDef[] = [
        { header: 'क्र.सं.', key: 'sn', width: 8 },
        { header: 'बिरामीको पूरा नाम', key: 'patientName', width: 24 },
        { header: 'Patient ID', key: 'patientCode', width: 16 },
        { header: 'औषधि प्रयोग मिति', key: 'date', width: 16 },
        { header: 'रसिद/भौचर नं.', key: 'voucher', width: 18 },
        { header: 'फ्याक्टर प्रकार', key: 'factorType', width: 16 },
        { header: 'औषधि तथा कम्पनी', key: 'product', width: 24 },
        { header: 'ब्याच नम्बर', key: 'batch', width: 16 },
        { header: 'भाइल क्षमता (IU)', key: 'capacity', width: 16 },
        { header: 'प्रयोग भएको भाइल', key: 'vials', width: 16 },
        { header: 'कुल प्रयोग IU', key: 'totalIu', width: 16 },
        { header: 'प्रयोगको प्रयोजन', key: 'purposes', width: 34 },
        { header: 'प्रयोजन विस्तृत विवरण', key: 'purposeDetails', width: 24 },
        { header: 'सिफारिस चिकित्सक', key: 'clinician', width: 20 },
        { header: 'वितरण स्याटेलाइट/कार्यालय', key: 'office', width: 24 },
        { header: 'वितरण गर्ने स्वास्थ्यकर्मी', key: 'dispensedBy', width: 20 },
        { header: 'कैफियत', key: 'remarks', width: 22 },
      ];

      // Flatten items so each administered item/batch is recorded with 100% auditable accuracy
      const sheet4Rows: any[] = [];
      let itemCounter = 1;

      for (const d of distributions) {
        let pList = d.purposes;
        try {
          pList = JSON.parse(d.purposes).join(', ');
        } catch (e) {}

        if (d.items && d.items.length > 0) {
          for (const it of d.items) {
            sheet4Rows.push({
              sn: itemCounter++,
              patientName: d.patient.fullName,
              patientCode: d.patient.patientCode,
              date: d.distributionDate.toISOString().slice(0, 10),
              voucher: d.voucherNumber,
              factorType: it.factorType || d.patient.factorType,
              product: `${it.companyName} - ${it.productName}`,
              batch: it.batchNumber,
              capacity: it.capacityIu,
              vials: it.vialCount,
              totalIu: it.totalIu,
              purposes: pList,
              purposeDetails: d.purposeDetails || '-',
              clinician: d.prescribingClinician || '-',
              office: d.office.nameNepali,
              dispensedBy: d.dispensedBy.name,
              remarks: d.remarks || '-',
            });
          }
        } else {
          sheet4Rows.push({
            sn: itemCounter++,
            patientName: d.patient.fullName,
            patientCode: d.patient.patientCode,
            date: d.distributionDate.toISOString().slice(0, 10),
            voucher: d.voucherNumber,
            factorType: d.patient.factorType,
            product: 'Factor',
            batch: '-',
            capacity: '-',
            vials: d.totalVials,
            totalIu: d.totalIu,
            purposes: pList,
            purposeDetails: d.purposeDetails || '-',
            clinician: d.prescribingClinician || '-',
            office: d.office.nameNepali,
            dispensedBy: d.dispensedBy.name,
            remarks: d.remarks || '-',
          });
        }
      }

      // Assemble all 4 sheets with thematic header colors
      const multiSheets: ExcelSheetDef[] = [
        {
          sheetName: '१. बिरामी अभिलेखीकरण',
          title: 'नेपाल हेमोफिलिया सोसाइटी - हेमोफिलिया बिरामीहरूको प्रारम्भिक दर्ता तथा आधारभूत अभिलेख',
          columns: sheet1Cols,
          rows: sheet1Rows,
          headerColor: 'FF1E3A8A', // Royal Navy Blue
        },
        {
          sheetName: '२. फ्याक्टर मौज्दात अवस्था',
          title: 'केन्द्रीय कार्यालय - क्लटिङ फ्याक्टर औषधिको वर्तमान मौज्दात विवरण (Current Factor Stock Status)',
          columns: sheet2Cols,
          rows: sheet2Rows,
          headerColor: 'FF0F766E', // Clinical Dark Teal
        },
        {
          sheetName: '३. स्याटेलाइट स्टक',
          title: 'क्षेत्रीय स्याटेलाइट कार्यालयहरूमा मौज्दात फ्याक्टर औषधिको विवरण (Satellite Stock Inventory)',
          columns: sheet3Cols,
          rows: sheet3Rows,
          headerColor: 'FF6B21A8', // Regional Purple
        },
        {
          sheetName: '४. बिरामी औषधि प्रयोग विवरण',
          title: 'बिरामीअनुसार फ्याक्टर औषधि प्रयोग, मिति, ब्याच तथा प्रयोजन विवरण (Patient Dispensation Logs)',
          columns: sheet4Cols,
          rows: sheet4Rows,
          headerColor: 'FF9F1239', // Blood Crimson Red
        },
      ];

      const masterBuffer = await generateMultiSheetWorkbook(multiSheets);
      const fileName = `hemophilia_master_report_${dateStr}.xlsx`;

      return new Response(new Uint8Array(masterBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

    // =========================================================================
    // CASE 2: SINGLE PATIENT DOSSIER EXPORT (PROFILE + COMPLETE CONSUMPTION HISTORY)
    // =========================================================================
    if (type === 'patient-single') {
      const patientId = searchParams.get('patientId');
      if (!patientId) {
        return NextResponse.json({ success: false, message: 'Patient ID आवश्यक छ।' }, { status: 400 });
      }

      const patient = await prisma.patient.findFirst({
        where: { OR: [{ id: patientId }, { patientCode: patientId }], isActive: true },
      });
      if (!patient) {
        return NextResponse.json({ success: false, message: 'बिरामी फेला परेन।' }, { status: 404 });
      }

      const distributions = await prisma.patientDistribution.findMany({
        where: { patientId: patient.id },
        include: { office: true, dispensedBy: true, items: true },
        orderBy: { distributionDate: 'asc' },
      });

      let totalVials = 0;
      let totalIu = 0;
      distributions.forEach((d) => {
        totalVials += d.totalVials;
        totalIu += d.totalIu;
      });

      // Sheet 1: बिरामी व्यक्तिगत विवरण (Patient Profile)
      const pCols: ExcelColumnDef[] = [
        { header: 'विवरण शीर्षक (Field)', key: 'field', width: 28 },
        { header: 'विवरण मान (Value)', key: 'value', width: 40 },
      ];

      const pRows = [
        { field: 'दर्ता कोड (Patient ID)', value: patient.patientCode },
        { field: 'बिरामीको पूरा नाम', value: patient.fullName },
        { field: 'उमेर / लिङ्ग', value: `${patient.age} वर्ष / ${patient.gender || 'पुरुष'}` },
        { field: 'रक्त समूह', value: patient.bloodGroup },
        { field: 'सम्पर्क फोन नम्बर', value: patient.phone },
        { field: 'स्थायी ठेगाना', value: `${patient.localLevel}-${patient.wardNo}, ${patient.district}, ${patient.province}` },
        { field: 'टोल / गाउँ', value: patient.toleAddress || '-' },
        { field: 'अस्थायी ठेगाना', value: patient.tempAddress || '-' },
        { field: 'फ्याक्टर प्रकार', value: patient.factorType },
        { field: 'फ्याक्टर स्तर (%)', value: patient.factorLevelPercent != null ? `${patient.factorLevelPercent}%` : 'अज्ञात' },
        { field: 'गम्भीरता (Severity)', value: patient.severity },
        { field: 'दर्ता मिति', value: patient.createdAt ? patient.createdAt.toISOString().slice(0, 10) : '-' },
        { field: 'दर्ता कार्यालय', value: officeMap[patient.registeredOfficeId] || patient.registeredOfficeId },
        { field: 'कुल औषधि प्राप्त पटक', value: `${distributions.length} पटक` },
        { field: 'कुल खपत भएको भाइल संख्या', value: `${totalVials} भाइल` },
        { field: 'कुल खपत भएको IU', value: `${totalIu.toLocaleString()} IU` },
      ];

      // Sheet 2: औषधि खपत विवरण (Factor Consumption Logs)
      const distCols: ExcelColumnDef[] = [
        { header: 'क्र.सं.', key: 'sn', width: 8 },
        { header: 'खपत मिति', key: 'date', width: 16 },
        { header: 'रसिद/भौचर नं.', key: 'voucher', width: 18 },
        { header: 'वितरण कार्यालय', key: 'office', width: 22 },
        { header: 'औषधि ब्रान्ड / कम्पनी', key: 'product', width: 24 },
        { header: 'ब्याच नम्बर', key: 'batch', width: 16 },
        { header: 'भाइल क्षमता (IU)', key: 'capacity', width: 14 },
        { header: 'खपत भाइल', key: 'vials', width: 14 },
        { header: 'कुल खपत IU', key: 'totalIu', width: 16 },
        { header: 'प्रयोगको प्रयोजन', key: 'purposes', width: 32 },
        { header: 'प्रयोजन विस्तृत विवरण', key: 'details', width: 24 },
        { header: 'सिफारिस चिकित्सक', key: 'clinician', width: 20 },
        { header: 'वितरण गर्ने कर्मचारी', key: 'dispensedBy', width: 20 },
        { header: 'कैफियत', key: 'remarks', width: 20 },
      ];

      const distRows: any[] = [];
      let itemCounter = 1;
      for (const d of distributions) {
        let pList = d.purposes;
        try {
          pList = JSON.parse(d.purposes).join(', ');
        } catch (e) {}

        if (d.items && d.items.length > 0) {
          for (const it of d.items) {
            distRows.push({
              sn: itemCounter++,
              date: d.distributionDate.toISOString().slice(0, 10),
              voucher: d.voucherNumber,
              office: d.office.nameNepali,
              product: `${it.companyName} - ${it.productName}`,
              batch: it.batchNumber,
              capacity: it.capacityIu,
              vials: it.vialCount,
              totalIu: it.totalIu,
              purposes: pList,
              details: d.purposeDetails || '-',
              clinician: d.prescribingClinician || '-',
              dispensedBy: d.dispensedBy.name,
              remarks: d.remarks || '-',
            });
          }
        } else {
          distRows.push({
            sn: itemCounter++,
            date: d.distributionDate.toISOString().slice(0, 10),
            voucher: d.voucherNumber,
            office: d.office.nameNepali,
            product: 'Factor',
            batch: '-',
            capacity: '-',
            vials: d.totalVials,
            totalIu: d.totalIu,
            purposes: pList,
            details: d.purposeDetails || '-',
            clinician: d.prescribingClinician || '-',
            dispensedBy: d.dispensedBy.name,
            remarks: d.remarks || '-',
          });
        }
      }

      const patientWorkbookBuffer = await generateMultiSheetWorkbook([
        {
          sheetName: '१. बिरामी व्यक्तिगत विवरण',
          title: `नेपाल हेमोफिलिया सोसाइटी - बिरामी प्रोफाइल (${patient.fullName} - ${patient.patientCode})`,
          columns: pCols,
          rows: pRows,
          headerColor: 'FF1E3A8A',
        },
        {
          sheetName: '२. औषधि खपत विवरण',
          title: `${patient.fullName} - क्लटिङ फ्याक्टर औषधि खपत तथा वितरण इतिहास`,
          columns: distCols,
          rows: distRows,
          headerColor: 'FF9F1239',
        },
      ]);

      const safeName = patient.fullName.replace(/[^a-zA-Z0-9_\u0900-\u097F]/g, '_');
      const pFileName = `patient_${patient.patientCode}_${safeName}_history.xlsx`;

      return new Response(new Uint8Array(patientWorkbookBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(pFileName)}"`,
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

    // =========================================================================
    // CASE 3: INDIVIDUAL WORKBOOK EXPORTS (IF USER SELECTS SPECIFIC TYPE)
    // =========================================================================
    let columns: ExcelColumnDef[] = [];
    let rows: Record<string, any>[] = [];
    let sheetName = 'Report';
    let fileName = `hemophilia-report-${Date.now()}.xlsx`;
    let title = 'Hemophilia Factor Management Report';

    switch (type) {
      case 'patients': {
        sheetName = 'बिरामी दर्ता सूची';
        fileName = `patients-register-${dateStr}.xlsx`;
        title = 'नेपाल हेमोफिलिया सोसाइटी - दर्ता भएका बिरामीहरूको अभिलेख';
        columns = [
          { header: 'Patient ID', key: 'code', width: 16 },
          { header: 'पूरा नाम', key: 'name', width: 24 },
          { header: 'उमेर', key: 'age', width: 10 },
          { header: 'लिङ्ग', key: 'gender', width: 10 },
          { header: 'फोन नम्बर', key: 'phone', width: 15 },
          { header: 'रक्त समूह', key: 'bloodGroup', width: 12 },
          { header: 'प्रदेश', key: 'province', width: 22 },
          { header: 'जिल्ला', key: 'district', width: 16 },
          { header: 'स्थानीय तह', key: 'localLevel', width: 22 },
          { header: 'वडा', key: 'ward', width: 8 },
          { header: 'फ्याक्टर प्रकार', key: 'factorType', width: 16 },
          { header: 'गम्भीरता (Severity)', key: 'severity', width: 18 },
          { header: 'दर्ता कार्यालय', key: 'office', width: 20 },
        ];

        const whereClause: any = { isActive: true };
        if (officeIdFilter) whereClause.registeredOfficeId = officeIdFilter;

        const patients = await prisma.patient.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
        });

        rows = patients.map((p) => ({
          code: p.patientCode,
          name: p.fullName,
          age: p.age,
          gender: p.gender || 'पुरुष',
          phone: p.phone,
          bloodGroup: p.bloodGroup,
          province: p.province,
          district: p.district,
          localLevel: p.localLevel,
          ward: p.wardNo,
          factorType: p.factorType,
          severity: p.severity,
          office: officeMap[p.registeredOfficeId] || p.registeredOfficeId,
        }));
        break;
      }

      case 'central-stock': {
        if (user.role !== 'SUPER_ADMIN') {
          return NextResponse.json({ success: false, message: 'अनुमति छैन।' }, { status: 403 });
        }
        sheetName = 'केन्द्रीय स्टक';
        fileName = `central-stock-${dateStr}.xlsx`;
        title = 'केन्द्रीय स्टक - मौज्दात विवरण';
        columns = [
          { header: 'कम्पनी', key: 'company', width: 22 },
          { header: 'उत्पादन/ब्रान्ड', key: 'product', width: 20 },
          { header: 'फ्याक्टर प्रकार', key: 'factorType', width: 16 },
          { header: 'क्षमता (IU)', key: 'capacity', width: 14 },
          { header: 'ब्याच नम्बर', key: 'batch', width: 18 },
          { header: 'म्याद मिति', key: 'expiry', width: 15 },
          { header: 'कुल प्राप्त भाइल', key: 'received', width: 16 },
          { header: 'पठाइएको भाइल', key: 'transferred', width: 16 },
          { header: 'बाँकी भाइल', key: 'current', width: 14 },
          { header: 'कुल बाँकी IU', key: 'totalIu', width: 16 },
          { header: 'स्थिति', key: 'status', width: 14 },
        ];

        const batches = await prisma.centralStockBatch.findMany({
          include: { company: true, product: true },
          orderBy: { expiryDate: 'asc' },
        });

        rows = batches.map((b) => ({
          company: b.company.name,
          product: b.product.name,
          factorType: b.product.factorType,
          capacity: b.capacityIu,
          batch: b.batchNumber,
          expiry: b.expiryDate.toISOString().slice(0, 10),
          received: b.receivedVials,
          transferred: b.transferredVials,
          current: b.currentVials,
          totalIu: b.currentVials * b.capacityIu,
          status: b.isQuarantined || b.expiryDate <= now ? 'म्याद सकिएको' : 'प्रयोगयोग्य',
        }));
        break;
      }

      case 'office-stock': {
        sheetName = 'कार्यालय स्टक रिपोर्ट';
        fileName = `office-stock-${dateStr}.xlsx`;
        title = 'स्याटेलाइट तथा विराटनगर कार्यालय स्टक मौज्दात';
        columns = [
          { header: 'कार्यालय', key: 'office', width: 20 },
          { header: 'कम्पनी', key: 'company', width: 20 },
          { header: 'उत्पादन', key: 'product', width: 18 },
          { header: 'फ्याक्टर प्रकार', key: 'factorType', width: 16 },
          { header: 'क्षमता (IU)', key: 'capacity', width: 14 },
          { header: 'ब्याच नं.', key: 'batch', width: 16 },
          { header: 'म्याद मिति', key: 'expiry', width: 14 },
          { header: 'प्राप्त भाइल', key: 'received', width: 14 },
          { header: 'वितरित भाइल', key: 'distributed', width: 14 },
          { header: 'बाँकी भाइल', key: 'current', width: 14 },
          { header: 'बाँकी IU', key: 'totalIu', width: 16 },
        ];

        const whereClause: any = {};
        if (officeIdFilter) whereClause.officeId = officeIdFilter;

        const batches = await prisma.officeStockBatch.findMany({
          where: whereClause,
          include: { office: true, company: true, product: true },
          orderBy: [{ officeId: 'asc' }, { expiryDate: 'asc' }],
        });

        rows = batches.map((b) => ({
          office: b.office.nameNepali,
          company: b.company.name,
          product: b.product.name,
          factorType: b.product.factorType,
          capacity: b.capacityIu,
          batch: b.batchNumber,
          expiry: b.expiryDate.toISOString().slice(0, 10),
          received: b.receivedVials,
          distributed: b.distributedVials,
          current: b.currentVials,
          totalIu: b.currentVials * b.capacityIu,
        }));
        break;
      }

      case 'distributions': {
        sheetName = 'औषधि वितरण विवरण';
        fileName = `patient-distributions-${dateStr}.xlsx`;
        title = 'बिरामी औषधि वितरण अभिलेख (Patient Factor Distribution)';
        columns = [
          { header: 'रसिद नं.', key: 'voucher', width: 18 },
          { header: 'मिति', key: 'date', width: 14 },
          { header: 'Patient ID', key: 'patientCode', width: 16 },
          { header: 'बिरामीको नाम', key: 'patientName', width: 22 },
          { header: 'कार्यालय', key: 'office', width: 20 },
          { header: 'कुल भाइल', key: 'vials', width: 12 },
          { header: 'कुल IU', key: 'iu', width: 14 },
          { header: 'वितरण प्रयोजन', key: 'purposes', width: 30 },
          { header: 'चिकित्सक', key: 'clinician', width: 20 },
          { header: 'वितरण गर्ने कर्मचारी', key: 'dispensedBy', width: 20 },
        ];

        const whereClause: any = {};
        if (officeIdFilter) whereClause.officeId = officeIdFilter;

        const dists = await prisma.patientDistribution.findMany({
          where: whereClause,
          include: { patient: true, office: true, dispensedBy: true },
          orderBy: { distributionDate: 'desc' },
        });

        rows = dists.map((d) => {
          let pList = d.purposes;
          try {
            pList = JSON.parse(d.purposes).join(', ');
          } catch (e) {}

          return {
            voucher: d.voucherNumber,
            date: d.distributionDate.toISOString().slice(0, 10),
            patientCode: d.patient.patientCode,
            patientName: d.patient.fullName,
            office: d.office.nameNepali,
            vials: d.totalVials,
            iu: d.totalIu,
            purposes: pList,
            clinician: d.prescribingClinician || '-',
            dispensedBy: d.dispensedBy.name,
          };
        });
        break;
      }

      default:
        return NextResponse.json({ success: false, message: 'अमान्य रिपोर्ट प्रकार' }, { status: 400 });
    }

    const fileBuffer = await generateExcelWorkbook(sheetName, columns, rows, title);
    const uint8Array = new Uint8Array(fileBuffer);

    return new Response(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Excel export error:', error);
    return NextResponse.json({ success: false, message: 'Excel फाइल निर्माण गर्दा समस्या आयो।' }, { status: 500 });
  }
}
