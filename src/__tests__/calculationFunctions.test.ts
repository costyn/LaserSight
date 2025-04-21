import { describe, it, expect } from 'vitest';
import { calculateWidth, calculateDistance, calculateAngle, MAX_ANGLE, getRecommendedScanRate, Scanner } from '../types';

describe('calculateWidth', () => {
  it('calculates width correctly for 30 degree angle at 10m distance', () => {
    // Width = 10 * tan(15°) * 2 = 10 * 0.268 * 2 ≈ 5.36
    expect(calculateWidth(30, 10)).toBeCloseTo(5.36, 1);
  });

  it('calculates width correctly for 45 degree angle at 5m distance', () => {
    // Width = 5 * tan(22.5°) * 2 = 5 * 0.414 * 2 ≈ 4.14
    expect(calculateWidth(45, 5)).toBeCloseTo(4.14, 1);
  });

  it('calculates width correctly for 60 degree angle at 15m distance', () => {
    // Width = 15 * tan(30°) * 2 = 15 * 0.577 * 2 ≈ 17.32
    expect(calculateWidth(60, 15)).toBeCloseTo(17.32, 1);
  });

  it('calculates zero width for 0 degree angle', () => {
    expect(calculateWidth(0, 10)).toBeCloseTo(0, 2);
  });

  it('calculates width for 80 degree angle', () => {
    // For 80 degree angle at 10m
    const width = calculateWidth(80, 10);
    expect(width).toBeCloseTo(16.78, 1);
  });

  it('prevents negative angles and sanitizes to 0', () => {
    // Should return the same as calculateWidth(0, 10)
    expect(calculateWidth(-30, 10)).toBeCloseTo(0, 2);
  });

  it('prevents negative distances and sanitizes to 0', () => {
    expect(calculateWidth(30, -10)).toBeCloseTo(0, 2);
  });

  it('scales linearly with distance', () => {
    const width5m = calculateWidth(30, 5);
    const width10m = calculateWidth(30, 10);
    expect(width10m).toBeCloseTo(width5m * 2, 10);
  });

  it('limits angles to MAX_ANGLE', () => {
    // Should be the same as calculateWidth(MAX_ANGLE, 10)
    const maxAllowedAngle = calculateWidth(MAX_ANGLE, 10);
    const overMaxAngle = calculateWidth(MAX_ANGLE + 10, 10);
    expect(overMaxAngle).toBeCloseTo(maxAllowedAngle, 10);
  });
});

describe('calculateDistance', () => {
  it('prevents negative angles and sanitizes to 0', () => {
    expect(calculateDistance(-30, 5)).toBeCloseTo(calculateDistance(0, 5), 10);
  });

  it('prevents negative widths and sanitizes to 0', () => {
    expect(calculateDistance(30, -5)).toBeCloseTo(0, 2);
  });

  it('limits angles to MAX_ANGLE', () => {
    const maxAllowedAngle = calculateDistance(MAX_ANGLE, 5);
    const overMaxAngle = calculateDistance(MAX_ANGLE + 10, 5);
    expect(overMaxAngle).toBeCloseTo(maxAllowedAngle, 10);
  });
});

describe('calculateAngle', () => {
  it('prevents negative widths and sanitizes to 0', () => {
    expect(calculateAngle(10, -5)).toBeCloseTo(0, 2);
  });

  it('limits calculated angle to MAX_ANGLE', () => {
    // Create inputs that would produce an angle > MAX_ANGLE
    const distance = 1;
    const width = 100; // This would create a very large angle
    const angle = calculateAngle(distance, width);
    expect(angle).toBeLessThanOrEqual(MAX_ANGLE);
    expect(angle).toBe(MAX_ANGLE); // Should be capped exactly at MAX_ANGLE
  });
});

describe('getRecommendedScanRate', () => {
  const testScanner: Scanner = {
    name: "Test Scanner",
    specs: [
      { angle: 4, kpps: 60, note: "ILDA at 4°" },
      { angle: 8, kpps: 40, note: "ILDA standard" }
    ]
  };

  it('returns exact match when angle exactly matches a spec', () => {
    const result = getRecommendedScanRate(testScanner, 8);
    expect(result.kpps).toBe(40);
    expect(result.note).toBe("ILDA standard");
  });

  it('interpolates between two known angles', () => {
    const result = getRecommendedScanRate(testScanner, 6);
    expect(result.kpps).toBeGreaterThan(40); // 6° should have higher KPPS than 8°
    expect(result.kpps).toBeLessThan(60);    // But less than 4°
    expect(result.note).toContain("Interpolated");
  });

  it('extrapolates for angles smaller than the smallest spec', () => {
    const result = getRecommendedScanRate(testScanner, 2);
    expect(result.kpps).toBeGreaterThan(60); // Should be higher than at 4°
    expect(result.note).toContain("Estimated");
    expect(result.note).toContain("<");
  });

  it('extrapolates for angles larger than the largest spec', () => {
    const result = getRecommendedScanRate(testScanner, 12);
    expect(result.kpps).toBeLessThan(40);    // Should be lower than at 8°
    expect(result.note).toContain("Estimated");
    expect(result.note).toContain(">");
  });

  it('handles scanner with one spec by using it directly', () => {
    const singleSpecScanner: Scanner = {
      name: "Single Spec Scanner",
      specs: [{ angle: 8, kpps: 40, note: "ILDA standard" }]
    };
    
    // For the exact angle, should return the spec
    const resultExact = getRecommendedScanRate(singleSpecScanner, 8);
    expect(resultExact.kpps).toBe(40);
    
    // For smaller angles, should extrapolate up
    const resultSmaller = getRecommendedScanRate(singleSpecScanner, 4);
    expect(resultSmaller.kpps).toBeGreaterThan(40);
    
    // For larger angles, should extrapolate down with quadratic falloff
    const resultLarger = getRecommendedScanRate(singleSpecScanner, 16);
    expect(resultLarger.kpps).toBeLessThan(40);
    expect(resultLarger.kpps).toBeCloseTo(40 / 4, 0); // Should be roughly 1/4 at double the angle
  });

  it('ensures kpps values are always positive', () => {
    const result = getRecommendedScanRate(testScanner, 80); // Very large angle
    expect(result.kpps).toBeGreaterThan(0);
  });

  it('handles duplicate angle values by using valid specs', () => {
    const duplicateAnglesScanner: Scanner = {
      name: "Duplicate Angles Scanner",
      specs: [
        { angle: 8, kpps: 40, note: "ILDA standard" },
        { angle: 8, kpps: 38, note: "Alternative spec" }
      ]
    };
    
    // Should find a spec with the matching angle
    const result = getRecommendedScanRate(duplicateAnglesScanner, 8);
    expect([38, 40]).toContain(result.kpps);
  });
});