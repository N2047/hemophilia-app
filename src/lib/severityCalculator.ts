/**
 * Hemophilia and Factor Deficiency Severity Classification Service
 * Based on World Federation of Hemophilia (WFH) Guidelines:
 * - Severe Hemophilia: < 1% (< 0.01 IU/mL)
 * - Moderate Hemophilia: 1% to 5% (0.01 - 0.05 IU/mL)
 * - Mild Hemophilia: > 5% to < 40% (0.05 - < 0.40 IU/mL)
 * - >= 40%: Clinically Normal / Non-hemophilic range (Review Required)
 */

export type SeverityLevel = 'SEVERE' | 'MODERATE' | 'MILD' | 'REVIEW_REQUIRED';

export interface SeverityResult {
  severity: SeverityLevel;
  labelNepali: string;
  labelEnglish: string;
  isStandardHemophilia: boolean;
  requiresReview: boolean;
  notes: string;
}

export function calculateFactorSeverity(
  factorType: string,
  factorLevelPercent: number | null | undefined
): SeverityResult {
  // If factor level is null, undefined, or empty, do not guess
  if (factorLevelPercent === null || factorLevelPercent === undefined || isNaN(factorLevelPercent)) {
    return {
      severity: 'REVIEW_REQUIRED',
      labelNepali: 'अज्ञात (चिकित्सकीय समीक्षा आवश्यक)',
      labelEnglish: 'Unknown (Clinical Review Required)',
      isStandardHemophilia: factorType === 'Factor VIII' || factorType === 'Factor IX',
      requiresReview: true,
      notes: 'फ्याक्टर प्रतिशत स्तर नखुलेकोले स्वतः वर्गीकरण गरिएको छैन।',
    };
  }

  const isStandard = factorType === 'Factor VIII' || factorType === 'Factor IX';

  if (!isStandard) {
    return {
      severity: 'REVIEW_REQUIRED',
      labelNepali: 'अन्य फ्याक्टर (विशेषज्ञ समीक्षा आवश्यक)',
      labelEnglish: 'Non-Standard Factor (Clinical Review Required)',
      isStandardHemophilia: false,
      requiresReview: true,
      notes: `${factorType} को लागि मानक Hemophilia A/B वर्गीकरण स्वतः लागू हुँदैन। चिकित्सकीय पुष्टि गर्नुहोस्।`,
    };
  }

  if (factorLevelPercent < 1) {
    return {
      severity: 'SEVERE',
      labelNepali: 'गम्भीर (Severe < 1%)',
      labelEnglish: 'Severe (< 1%)',
      isStandardHemophilia: true,
      requiresReview: false,
      notes: 'गम्भीर प्रकारको हेमोफिलिया: जोर्नी तथा मांसपेशीमा स्वतः रक्तस्राव हुन सक्छ।',
    };
  } else if (factorLevelPercent >= 1 && factorLevelPercent < 5) {
    return {
      severity: 'MODERATE',
      labelNepali: 'मध्यम (Moderate 1% - 5%)',
      labelEnglish: 'Moderate (1% - 5%)',
      isStandardHemophilia: true,
      requiresReview: false,
      notes: 'मध्यम प्रकारको हेमोफिलिया: सामान्य चोटपटक वा शल्यक्रियामा रक्तस्राव।',
    };
  } else if (factorLevelPercent >= 5 && factorLevelPercent < 40) {
    return {
      severity: 'MILD',
      labelNepali: 'सामान्य (Mild 5% - 40%)',
      labelEnglish: 'Mild (5% - 40%)',
      isStandardHemophilia: true,
      requiresReview: false,
      notes: 'सामान्य प्रकारको हेमोफिलिया: ठूलो चोटपटक वा शल्यक्रियामा मात्र रक्तस्राव।',
    };
  } else {
    return {
      severity: 'REVIEW_REQUIRED',
      labelNepali: 'सामान्य दायरा (४०% वा माथि - समीक्षा आवश्यक)',
      labelEnglish: 'Normal Range (>= 40% - Clinical Review Required)',
      isStandardHemophilia: true,
      requiresReview: true,
      notes: 'फ्याक्टर मात्रा ४०% वा सोभन्दा बढी भएकोले यसलाई हेमोफिलियाको नियमित श्रेणी नदिई चिकित्सकीय समीक्षा आवश्यक तोकिएको छ।',
    };
  }
}
