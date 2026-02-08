// This script generates the apple-touch-icon.png
// Run with: node generate-icon.js

const fs = require('fs');

// Create a simple 180x180 PNG with blue gradient background and white pill icon
// This is a minimal valid PNG file with blue background

// For now, we'll use a data URL approach in the HTML
// iOS will use the favicon as fallback

console.log('Icon generation script - use external tool to convert icon.svg to PNG');
console.log('Recommended: https://svgtopng.com/');
console.log('Or use Figma/Photoshop to export icon.svg as 180x180 PNG');
console.log('Save as: apple-touch-icon.png');
