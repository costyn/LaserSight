import { useState, useEffect } from 'react';
import LaserSightCalculator from './components/LaserSightCalculator.tsx';
import scannerDatabase from './data/scannerDatabase.json';
import { ScannerDatabase } from './types.ts';

function App() {
  const [scanners, setScanners] = useState<ScannerDatabase>({});

  useEffect(() => {
    setScanners(scannerDatabase);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto">

        <LaserSightCalculator scannerDatabase={scanners} />

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>LaserSight © {new Date().getFullYear()} - Laser Scanner Calculator for Projection Artists</p>
        </footer>
      </div>
    </div>
  );
}

export default App;