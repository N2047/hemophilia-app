import { describe, it, expect } from 'vitest';
import { calculateFactorSeverity } from '../src/lib/severityCalculator';
import {
  NEPAL_ADMINISTRATIVE_DATA,
  getDistrictsByProvince,
  getLocalLevelsByDistrict,
  getWardsForLocalLevel,
} from '../src/data/nepalAdministrativeData';

describe('A. Factor Severity Thresholds and Guidelines', () => {
  it('classifies Factor VIII < 1% as SEVERE', () => {
    const res = calculateFactorSeverity('Factor VIII', 0.5);
    expect(res.severity).toBe('SEVERE');
    expect(res.requiresReview).toBe(false);
  });

  it('classifies Factor IX between 1% and < 5% as MODERATE', () => {
    const res = calculateFactorSeverity('Factor IX', 2.5);
    expect(res.severity).toBe('MODERATE');
    expect(res.requiresReview).toBe(false);
  });

  it('classifies Factor VIII between 5% and < 40% as MILD', () => {
    const res = calculateFactorSeverity('Factor VIII', 12.0);
    expect(res.severity).toBe('MILD');
    expect(res.requiresReview).toBe(false);
  });

  it('flags >= 40% as REVIEW_REQUIRED (not auto mild/severe)', () => {
    const res = calculateFactorSeverity('Factor VIII', 55.0);
    expect(res.severity).toBe('REVIEW_REQUIRED');
    expect(res.requiresReview).toBe(true);
  });

  it('flags non-standard factor (e.g. Factor VII, Factor II) as requiring clinical review', () => {
    const res = calculateFactorSeverity('Factor VII', 2.0);
    expect(res.severity).toBe('REVIEW_REQUIRED');
    expect(res.isStandardHemophilia).toBe(false);
  });

  it('does not guess severity when level is null or undefined', () => {
    const res = calculateFactorSeverity('Factor VIII', null);
    expect(res.severity).toBe('REVIEW_REQUIRED');
    expect(res.requiresReview).toBe(true);
  });
});

describe('B. Nepal Administrative Data Cascading Hierarchy', () => {
  it('contains all 7 Provinces with official designations', () => {
    expect(NEPAL_ADMINISTRATIVE_DATA.length).toBe(7);
  });

  it('retrieves official districts for Koshi Province (Province 1)', () => {
    const districts = getDistrictsByProvince('province-1');
    expect(districts.length).toBeGreaterThanOrEqual(14);
    const districtIds = districts.map((d) => d.id);
    expect(districtIds).toContain('morang');
    expect(districtIds).toContain('jhapa');
    expect(districtIds).toContain('sunsari');
    expect(districtIds).toContain('dhankuta');
    expect(districtIds).toContain('udayapur');
    expect(districtIds).toContain('okhaldhunga');
  });

  it('retrieves local levels for Morang District (including Biratnagar and Urlabari)', () => {
    const localLevels = getLocalLevelsByDistrict('province-1', 'morang');
    const localIds = localLevels.map((l) => l.id);
    expect(localIds).toContain('biratnagar-metro');
    expect(localIds).toContain('urlabari-mun');
  });

  it('generates correct total wards for Biratnagar Metropolitan (19 wards)', () => {
    const wards = getWardsForLocalLevel('province-1', 'morang', 'biratnagar-metro');
    expect(wards.length).toBe(19);
    expect(wards[0]).toBe(1);
    expect(wards[18]).toBe(19);
  });
});
