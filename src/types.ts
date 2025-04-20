// types.ts
export interface ScannerSpec {
    angle: number;  // in degrees
    kpps: number;   // points per second in thousands
    note: string;   // additional information
}

export interface Scanner {
    name: string;
    specs: ScannerSpec[];
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

// Helper function to find recommended scan rate
export const getRecommendedScanRate = (
    scanner: Scanner,
    angle: number
): { kpps: number; note: string } => {
    if (!scanner || !scanner.specs || scanner.specs.length === 0) {
        return { kpps: 0, note: "Unknown" };
    }

    // Ensure positive angle value
    const safeAngle = Math.max(0, Math.min(angle, MAX_ANGLE));

    // Find the closest angle specification
    let closestSpec = scanner.specs[0];
    let minDiff = Math.abs(scanner.specs[0].angle - safeAngle);

    for (let i = 1; i < scanner.specs.length; i++) {
        const diff = Math.abs(scanner.specs[i].angle - safeAngle);
        if (diff < minDiff) {
            minDiff = diff;
            closestSpec = scanner.specs[i];
        }
    }

    return { kpps: closestSpec.kpps, note: closestSpec.note };
};