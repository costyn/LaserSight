import { describe, it, expect } from 'vitest';
import { calculateWidth, calculateDistance, calculateAngle, MAX_ANGLE } from '../types';

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
  it('prevents negative distances but returns valid angle calculation', () => {
    // Since we use Math.max(0, distance), a negative distance becomes 0
    // With distance=0 and width>0, the angle calculation results in MAX_ANGLE
    expect(calculateAngle(-10, 5)).toBe(MAX_ANGLE);
  });

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