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

// Scanner calculation functions
export const calculateWidth = (angle: number, distance: number): number => {
    return distance * Math.tan((angle / 2) * (Math.PI / 180)) * 2;
};

export const calculateDistance = (angle: number, width: number): number => {
    return width / (Math.tan((angle / 2) * (Math.PI / 180)) * 2);
};

export const calculateAngle = (distance: number, width: number): number => {
    return 2 * Math.atan(width / (distance * 2)) * (180 / Math.PI);
};

// Helper function to find recommended scan rate
export const getRecommendedScanRate = (
    scanner: Scanner,
    angle: number
): { kpps: number; note: string } => {
    if (!scanner || !scanner.specs || scanner.specs.length === 0) {
        return { kpps: 0, note: "Unknown" };
    }

    // Find the closest angle specification
    let closestSpec = scanner.specs[0];
    let minDiff = Math.abs(scanner.specs[0].angle - angle);

    for (let i = 1; i < scanner.specs.length; i++) {
        const diff = Math.abs(scanner.specs[i].angle - angle);
        if (diff < minDiff) {
            minDiff = diff;
            closestSpec = scanner.specs[i];
        }
    }

    return { kpps: closestSpec.kpps, note: closestSpec.note };
};