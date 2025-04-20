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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="container mx-auto">

        <LaserSightCalculator scannerDatabase={scanners} />

        <footer className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>LaserSight by Costyn van Dongen - MIT license. <a href="https://github.com/costyn/LaserSight">Source available on Github.com</a></p>
        </footer>
      </div>
    </div>
  );
}

export default App;