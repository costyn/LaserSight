import { useState, useEffect } from 'react';
import {
    ScannerDatabase,
    CalculationMode,
    calculateWidth,
    calculateDistance,
    calculateAngle,
    getRecommendedScanRate
} from '../types';

interface LaserSightCalculatorProps {
    scannerDatabase: ScannerDatabase;
}

const LaserSightCalculator = ({ scannerDatabase }: LaserSightCalculatorProps) => {
    const [angle, setAngle] = useState<number | null>(8);
    const [distance, setDistance] = useState<number | null>(10);
    const [width, setWidth] = useState<number | null>(null);
    const [selectedScanner, setSelectedScanner] = useState<string>("DT40");
    const [calculationMode, setCalculationMode] = useState<CalculationMode>("width");

    // Calculate the third value based on the selected mode
    const calculateValue = (): number => {
        if (calculationMode === "width" && angle !== null && distance !== null) {
            return calculateWidth(angle, distance);
        } else if (calculationMode === "distance" && angle !== null && width !== null) {
            return calculateDistance(angle, width);
        } else if (calculationMode === "angle" && distance !== null && width !== null) {
            return calculateAngle(distance, width);
        }
        return 0;
    };

    // Get recommended scan rate for current angle
    const getRecommendedScanRateDisplay = (): string => {
        if (!scannerDatabase[selectedScanner] || angle === null) return "Unknown";

        const result = getRecommendedScanRate(scannerDatabase[selectedScanner], angle);
        return `${result.kpps}K points/sec (${result.note})`;
    };

    // Calculate result when inputs change
    useEffect(() => {
        if (calculationMode === "width" && angle !== null && distance !== null) {
            setWidth(calculateValue());
        } else if (calculationMode === "distance" && angle !== null && width !== null) {
            setDistance(calculateValue());
        } else if (calculationMode === "angle" && distance !== null && width !== null) {
            setAngle(calculateValue());
        }
    }, [angle, distance, width, calculationMode]);

    const handleInputChange = (setter) => (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            setter(value);
        } else {
            setter(null);
        }
    };

    const handleModeChange = (mode: CalculationMode) => {
        setCalculationMode(mode);
        if (mode === "width") setWidth(null);
        if (mode === "distance") setDistance(null);
        if (mode === "angle") setAngle(null);
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">LaserSight Calculator</h1>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Calculate:</label>
                <div className="flex space-x-4">
                    <button
                        onClick={() => handleModeChange("width")}
                        className={`px-3 py-1 rounded ${calculationMode === "width" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    >
                        Width
                    </button>
                    <button
                        onClick={() => handleModeChange("distance")}
                        className={`px-3 py-1 rounded ${calculationMode === "distance" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    >
                        Distance
                    </button>
                    <button
                        onClick={() => handleModeChange("angle")}
                        className={`px-3 py-1 rounded ${calculationMode === "angle" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    >
                        Angle
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Scanner Type:</label>
                <select
                    value={selectedScanner}
                    onChange={(e) => setSelectedScanner(e.target.value)}
                    className="w-full p-2 border rounded"
                >
                    {Object.keys(scannerDatabase).map(scanner => (
                        <option key={scanner} value={scanner}>{scannerDatabase[scanner].name}</option>
                    ))}
                </select>
            </div>

            {calculationMode !== "angle" && (
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Scan Angle (degrees):</label>
                    <input
                        type="number"
                        value={angle || ""}
                        onChange={handleInputChange(setAngle)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter scan angle"
                        disabled={calculationMode === "angle"}
                    />
                </div>
            )}

            {calculationMode !== "distance" && (
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Distance (meters):</label>
                    <input
                        type="number"
                        value={distance || ""}
                        onChange={handleInputChange(setDistance)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter distance"
                        disabled={calculationMode === "distance"}
                    />
                </div>
            )}

            {calculationMode !== "width" && (
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Projection Width (meters):</label>
                    <input
                        type="number"
                        value={width || ""}
                        onChange={handleInputChange(setWidth)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter projection width"
                        disabled={calculationMode === "width"}
                    />
                </div>
            )}

            <div className="bg-gray-100 p-4 rounded-lg">
                <h2 className="font-bold text-lg mb-2">Results:</h2>

                <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Scan Angle:</div>
                    <div>{angle !== null ? angle.toFixed(2) + "°" : "N/A"}</div>

                    <div className="font-medium">Distance:</div>
                    <div>{distance !== null ? distance.toFixed(2) + " m" : "N/A"}</div>

                    <div className="font-medium">Projection Width:</div>
                    <div>{width !== null ? width.toFixed(2) + " m" : "N/A"}</div>

                    <div className="font-medium">Max Scan Rate:</div>
                    <div>{getRecommendedScanRateDisplay()}</div>
                </div>
            </div>
        </div>
    );
};

export default LaserSightCalculator;