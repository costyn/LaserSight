# Changelog

All notable changes to the LaserSight Calculator will be documented in this file.

## [Unreleased]

### Added
- Input sanitization to prevent negative values for width, distance, and angle
- Added MAX_ANGLE constant (90 degrees) to limit angle values
- HTML input validation with min/max attributes
- Enhanced button behavior to respect value limits
- Automatic rounding of values to 2 decimal places in input fields
- Dark mode support with dark theme set as default
- Theme toggle in the upper right corner of the calculator
- Theme persistence using localStorage
- Advanced KPPS interpolation between scanner angle specifications
- Improved physics-based calculation model for scanner capabilities
- Extrapolation for angles outside the scanner's specification range

### Fixed
- Disabled minus buttons properly when values reach zero
- Fixed incorrect disable logic on distance and width minus buttons
- Fixed display of very long decimal numbers when switching calculation modes
- Prevented flash of wrong theme on page load

### Improved
- Added comprehensive tests for input validation and sanitization
- Ensured all calculation functions handle edge cases correctly
- Better user experience with rounded display values while maintaining calculation precision
- Enhanced UI with proper dark mode styling for all elements
- More accurate scanner performance estimation with inverse square relationship model
- Better predictions of maximum scan rates for any given angle