import { useState, useEffect, ChangeEvent } from 'react';
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
    const [calculationMode, setCalculationMode] = useState<CalculationMode>(CalculationMode.Width);

    // Calculate the third value based on the selected mode
    const calculateValue = (): number => {
        if (calculationMode === CalculationMode.Width && angle !== null && distance !== null) {
            return calculateWidth(angle, distance);
        } else if (calculationMode === CalculationMode.Distance && angle !== null && width !== null) {
            return calculateDistance(angle, width);
        } else if (calculationMode === CalculationMode.Angle && distance !== null && width !== null) {
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
        if (calculationMode === CalculationMode.Width && angle !== null && distance !== null) {
            setWidth(calculateValue());
        } else if (calculationMode === CalculationMode.Distance && angle !== null && width !== null) {
            setDistance(calculateValue());
        } else if (calculationMode === CalculationMode.Angle && distance !== null && width !== null) {
            setAngle(calculateValue());
        }
    }, [angle, distance, width, calculationMode]);

    type SetterFunction = React.Dispatch<React.SetStateAction<number | null>>;

    const handleInputChange = (setter: SetterFunction) => (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            setter(value);
        } else {
            setter(null);
        }
    };

    const handleModeChange = (mode: CalculationMode) => {
        setCalculationMode(mode);
        if (mode === CalculationMode.Width) setWidth(null);
        if (mode === CalculationMode.Distance) setDistance(null);
        if (mode === CalculationMode.Angle) setAngle(null);
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">LaserSight Calculator</h1>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Calculate:</label>
                <div className="flex space-x-4">
                    <button
                        onClick={() => handleModeChange(CalculationMode.Width)}
                        className={`px-3 py-1 rounded ${calculationMode === CalculationMode.Width ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    >
                        Width
                    </button>
                    <button
                        onClick={() => handleModeChange(CalculationMode.Distance)}
                        className={`px-3 py-1 rounded ${calculationMode === CalculationMode.Distance ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    >
                        Distance
                    </button>
                    <button
                        onClick={() => handleModeChange(CalculationMode.Angle)}
                        className={`px-3 py-1 rounded ${calculationMode === CalculationMode.Angle ? "bg-blue-500 text-white" : "bg-gray-200"}`}
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

            {calculationMode !== CalculationMode.Angle && (
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Scan Angle (degrees):</label>
                    <input
                        type="number"
                        value={angle || ""}
                        onChange={handleInputChange(setAngle)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter scan angle"
                    />
                </div>
            )}

            {calculationMode !== CalculationMode.Distance && (
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Distance (meters or feet):</label>
                    <input
                        type="number"
                        value={distance || ""}
                        onChange={handleInputChange(setDistance)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter distance"
                    />
                </div>
            )}

            {calculationMode !== CalculationMode.Width && (
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Projection Width (meters or feet):</label>
                    <input
                        type="number"
                        value={width || ""}
                        onChange={handleInputChange(setWidth)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter projection width"
                    />
                </div>
            )}

            <div className="bg-gray-100 p-4 rounded-lg">
                <h2 className="font-bold text-lg mb-2">Results:</h2>

                <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Scan Angle:</div>
                    <div>{angle !== null ? angle.toFixed(2) + "°" : "N/A"}</div>

                    <div className="font-medium">Distance:</div>
                    <div>{distance !== null ? distance.toFixed(2) + " meters (or feet)" : "N/A"}</div>

                    <div className="font-medium">Projection Width:</div>
                    <div>{width !== null ? width.toFixed(2) + " meters (or feet)" : "N/A"}</div>

                    <div className="font-medium">Max Scan Rate:</div>
                    <div>{getRecommendedScanRateDisplay()}</div>
                </div>
            </div>
        </div>
    );
};

export default LaserSightCalculator;