const sharp = require('sharp');
const path = require('path');

// Generate PNG icon
sharp('round-icons-skpI6e5yoeE-unsplash.svg')
  .resize(32, 32)
  .png()
  .toFile(path.join('src/app', 'icon.png'))
  .then(() => console.log('PNG icon created successfully!'))
  .catch(err => console.error('Error creating PNG icon:', err));

// Generate ICO favicon
sharp('round-icons-skpI6e5yoeE-unsplash.svg')
  .resize(32, 32)
  .toFile(path.join('src/app', 'favicon.ico'))
  .then(() => console.log('ICO favicon created successfully!'))
  .catch(err => console.error('Error creating ICO favicon:', err)); 