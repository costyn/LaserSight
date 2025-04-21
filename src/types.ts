// types.ts
export interface ScannerSpec {
    angle: number;  // in degrees
    kpps: number;   // points per second in thousands
    note: string;   // additional information
}

export interface Scanner {
    name: string;
    specs: ScannerSpec[];
    maxAngle?: number;  // maximum scan angle in degrees
    maxKpps?: number;   // absolute maximum KPPS the scanner can handle
}

export interface ScannerDatabase {
    [key: string]: Scanner;
}

export enum CalculationMode {
    Width = "width",
    Distance = "distance",
    Angle = "angle"
}

export const MAX_ANGLE = 90;

// Helper function to check if an angle exceeds a scanner's maximum
export const exceedsMaxScannerAngle = (scanner: Scanner | undefined, angle: number): boolean => {
    if (!scanner || scanner.maxAngle === undefined) return false;
    return angle > scanner.maxAngle;
};

// Scanner calculation functions
export const calculateWidth = (angle: number, distance: number): number => {
    // Ensure positive values
    const safeAngle = Math.max(0, Math.min(angle, MAX_ANGLE));
    const safeDistance = Math.max(0, distance);
    return safeDistance * Math.tan((safeAngle / 2) * (Math.PI / 180)) * 2;
};

export const calculateDistance = (angle: number, width: number): number => {
    // Ensure positive values
    const safeAngle = Math.max(0, Math.min(angle, MAX_ANGLE));
    const safeWidth = Math.max(0, width);
    return safeWidth / (Math.tan((safeAngle / 2) * (Math.PI / 180)) * 2);
};

export const calculateAngle = (distance: number, width: number): number => {
    // Ensure positive values
    const safeDistance = Math.max(0, distance);
    const safeWidth = Math.max(0, width);
    // Calculate and limit to MAX_ANGLE
    const calculatedAngle = 2 * Math.atan(safeWidth / (safeDistance * 2)) * (180 / Math.PI);
    return Math.min(calculatedAngle, MAX_ANGLE);
};

// Helper function to find recommended scan rate with interpolation
export const getRecommendedScanRate = (
    scanner: Scanner | undefined,
    angle: number
): { kpps: number; note: string } => {
    if (!scanner || !scanner.specs || scanner.specs.length === 0) {
        return { kpps: 0, note: "Unknown" };
    }

    // Check if the angle exceeds the scanner's maximum angle capability
    if (scanner.maxAngle && angle > scanner.maxAngle) {
        return { 
            kpps: 0, 
            note: `Exceeds max angle (${scanner.maxAngle}°)` 
        };
    }

    // Ensure positive angle value
    const safeAngle = Math.max(0, Math.min(angle, MAX_ANGLE));
    
    // Sort specs by angle to ensure proper interpolation
    const sortedSpecs = [...scanner.specs].sort((a, b) => a.angle - b.angle);
    
    // If angle exactly matches a spec, return that exact spec
    const exactMatch = sortedSpecs.find(spec => spec.angle === safeAngle);
    if (exactMatch) {
        return { kpps: exactMatch.kpps, note: exactMatch.note };
    }
    
    // If angle is smaller than the smallest spec angle
    if (safeAngle < sortedSpecs[0].angle) {
        // Extrapolate upward (smaller angle = higher KPPS generally)
        // Use simple ratio for extrapolation to avoid unrealistic values
        const ratio = sortedSpecs[0].angle / safeAngle;
        // Limit the ratio to prevent unrealistic values
        const cappedRatio = Math.min(ratio, 1.5);
        const extrapolatedKpps = Math.round(sortedSpecs[0].kpps * cappedRatio);
        
        // Check against the maximum KPPS value for the scanner
        const limitedKpps = scanner.maxKpps ? Math.min(extrapolatedKpps, scanner.maxKpps) : extrapolatedKpps;
        
        return { 
            kpps: limitedKpps, 
            note: limitedKpps === scanner.maxKpps 
                ? `Max KPPS (${scanner.maxKpps}K)`
                : `Estimated (< ${sortedSpecs[0].angle}°)` 
        };
    }
    
    // If angle is larger than the largest spec angle
    if (safeAngle > sortedSpecs[sortedSpecs.length - 1].angle) {
        // Extrapolate downward (larger angle = lower KPPS generally)
        // Use a quadratic falloff for more realistic values at larger angles
        const largest = sortedSpecs[sortedSpecs.length - 1];
        const ratio = safeAngle / largest.angle;
        // Quadratic falloff (inverse square relationship approximation)
        // but ensure we don't go below 1 KPPS
        const extrapolatedKpps = Math.max(1, Math.round(largest.kpps / (ratio * ratio)));
        return { 
            kpps: extrapolatedKpps, 
            note: `Estimated (> ${largest.angle}°)` 
        };
    }
    
    // Find the two specs to interpolate between
    let lowerSpec = sortedSpecs[0];
    let upperSpec = sortedSpecs[sortedSpecs.length - 1];
    
    for (let i = 0; i < sortedSpecs.length - 1; i++) {
        if (sortedSpecs[i].angle <= safeAngle && sortedSpecs[i + 1].angle >= safeAngle) {
            lowerSpec = sortedSpecs[i];
            upperSpec = sortedSpecs[i + 1];
            break;
        }
    }
    
    // Perform interpolation using inverse square relationship
    // This models the physical reality better than linear interpolation
    // Because KPPS capacity typically falls off with the square of the angle
    
    // Calculate normalized position between the two angles
    const ratio = (safeAngle - lowerSpec.angle) / (upperSpec.angle - lowerSpec.angle);
    
    // For scanner data, typically smaller angles = higher KPPS and larger angles = lower KPPS
    // This is an inverse relationship but not exactly linear
    
    // Use an inverse square weighted interpolation
    // This gives better results when working with the physics of galvanometers
    const angleRatio = lowerSpec.angle / upperSpec.angle;
    const weight = (1 - ratio) * (1 + Math.pow(angleRatio, 2));
    
    // Reverse the interpolation direction if needed - smaller angle should have higher KPPS
    let smallerAngleSpec, largerAngleSpec;
    if (lowerSpec.angle < upperSpec.angle) {
        smallerAngleSpec = lowerSpec;
        largerAngleSpec = upperSpec;
    } else {
        smallerAngleSpec = upperSpec;
        largerAngleSpec = lowerSpec;
    }
    
    // Interpolate in the right direction (smaller angle = higher KPPS typically)
    const interpolatedKpps = Math.round(
        smallerAngleSpec.kpps * weight + largerAngleSpec.kpps * (1 - weight)
    );
    
    // Final safety checks
    let finalKpps = interpolatedKpps;
    
    // If interpolation gives values outside the expected range, use maximum of the specs
    if (finalKpps > Math.max(smallerAngleSpec.kpps, largerAngleSpec.kpps) || 
        finalKpps < 0) {
        finalKpps = Math.max(smallerAngleSpec.kpps, largerAngleSpec.kpps);
    }
    
    // Ensure we always return a positive value
    finalKpps = Math.max(1, finalKpps);
    
    // Respect the maximum KPPS value for the scanner
    if (scanner.maxKpps && finalKpps > scanner.maxKpps) {
        return {
            kpps: scanner.maxKpps,
            note: `Max KPPS (${scanner.maxKpps}K)`
        };
    }
    
    return { 
        kpps: finalKpps, 
        note: `Interpolated (${lowerSpec.angle}° - ${upperSpec.angle}°)` 
    };
};