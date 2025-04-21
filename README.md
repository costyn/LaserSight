# LaserSight Project Structure

```
lasersight/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── public/
│   ├── favicon.ico
│   └── logo.svg
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types.ts
    ├── components/
    │   └── LaserSightCalculator.tsx
    └── data/
        └── scannerDatabase.json
```

## Run Development Server

```bash
npm run dev
```

## Features

- **Calculation Modes**:
  - Calculate Width from Angle and Distance
  - Calculate Distance from Angle and Width
  - Calculate Angle from Distance and Width

- **Scanner Database**:
  - Select from multiple scanner models
  - View scanner-specific point rate limitations

- **Real-time Calculation**:
  - Automatic recalculation as values change
  - ILDA standard rate recommendations

- **Responsive Design**:
  - Works on mobile, tablet, and desktop

## Future Enhancements

- User-uploadable scanner specifications
- Visual diagram of projection setup
- Save favorite configurations
- DONE: Dark mode support