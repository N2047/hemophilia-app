import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3, 'प्रयोगकर्ता नाम कम्तीमा ३ अक्षरको हुनुपर्छ'),
  password: z.string().min(6, 'पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ'),
});

export const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export const patientSchema = z.object({
  fullName: z.string().min(2, 'बिरामीको पूरा नाम कम्तीमा २ अक्षरको हुनुपर्छ'),
  dateOfBirth: z.string().nullable().optional(),
  isDobEstimated: z.boolean().default(false),
  age: z.coerce.number().int().min(0, 'उमेर ऋणात्मक हुन सक्दैन').max(120, 'मान्य उमेर प्रविष्ट गर्नुहोस्'),
  gender: z.string().optional().default('पुरुष'),
  phone: z.string().regex(/^(98|97|96|0\d)\d{7,8}$/, 'मान्य नेपाली फोन/मोबाइल नम्बर (१० अंक) प्रविष्ट गर्नुहोस्'),
  bloodGroup: z.enum(bloodGroups, {
    errorMap: () => ({ message: 'कृपया मान्य रक्त समूह छान्नुहोस्' }),
  }),
  province: z.string().min(1, 'कृपया प्रदेश छान्नुहोस्'),
  district: z.string().min(1, 'कृपया जिल्ला छान्नुहोस्'),
  localLevel: z.string().min(1, 'कृपया स्थानीय तह छान्नुहोस्'),
  wardNo: z.coerce.number().int().min(1, 'वडा नम्बर कम्तीमा १ हुनुपर्छ').max(50, 'मान्य वडा नम्बर प्रविष्ट गर्नुहोस्'),
  toleAddress: z.string().optional().nullable(),
  tempAddress: z.string().optional().nullable(),
  factorType: z.string().min(1, 'कृपया फ्याक्टर प्रकार छान्नुहोस्'),
  otherFactorDetails: z.string().optional().nullable(),
  factorLevelPercent: z.coerce.number().min(0).max(150).nullable().optional(),
  severity: z.enum(['SEVERE', 'MODERATE', 'MILD', 'REVIEW_REQUIRED']),
  severityOverridden: z.boolean().default(false),
  overrideReason: z.string().optional().nullable(),
  registeredOfficeId: z.string().min(1, 'दर्ता गर्ने कार्यालय चयन गर्नुहोस्'),
});

export const centralStockEntrySchema = z.object({
  receiptDate: z.string().min(1, 'प्राप्ति मिति अनिवार्य छ'),
  companyId: z.string().min(1, 'कम्पनी छान्नुहोस्'),
  productId: z.string().min(1, 'उत्पादन/फ्याक्टर छान्नुहोस्'),
  capacityIu: z.coerce.number().int().positive('भाइल क्षमता धनात्मक हुनुपर्छ'),
  vialCount: z.coerce.number().int().positive('भाइल संख्या कम्तीमा १ हुनुपर्छ'),
  batchNumber: z.string().min(1, 'ब्याच नम्बर अनिवार्य छ').trim(),
  expiryDate: z.string().min(1, 'म्याद सकिने मिति अनिवार्य छ'),
  remarks: z.string().optional().nullable(),
});

export const stockTransferItemSchema = z.object({
  centralStockBatchId: z.string().min(1, 'केन्द्रीय ब्याच अनिवार्य छ'),
  vialCount: z.coerce.number().int().positive('भाइल संख्या कम्तीमा १ हुनुपर्छ'),
});

export const stockTransferSchema = z.object({
  transferDate: z.string().min(1, 'पठाएको मिति अनिवार्य छ'),
  destinationOfficeId: z.string().min(1, 'प्राप्त गर्ने कार्यालय/स्याटेलाइट छान्नुहोस्'),
  remarks: z.string().optional().nullable(),
  items: z.array(stockTransferItemSchema).min(1, 'कम्तीमा एउटा औषधि item छान्नुहोस्'),
});

export const patientDistributionItemSchema = z.object({
  officeStockBatchId: z.string().min(1, 'कार्यालयको स्टक ब्याच अनिवार्य छ'),
  vialCount: z.coerce.number().int().positive('भाइल संख्या कम्तीमा १ हुनुपर्छ'),
});

export const patientDistributionSchema = z.object({
  distributionDate: z.string().min(1, 'वितरण मिति अनिवार्य छ'),
  patientId: z.string().min(1, 'बिरामी अनिवार्य छ'),
  officeId: z.string().min(1, 'कार्यालय अनिवार्य छ'),
  prescribingClinician: z.string().optional().nullable(),
  purposes: z.array(z.string()).min(1, 'कम्तीमा एउटा वितरण प्रयोजन छान्नुहोस्'),
  purposeDetails: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
  items: z.array(patientDistributionItemSchema).min(1, 'कम्तीमा एउटा औषधि भाइल वितरण गर्नुपर्छ'),
});
