const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'components', 'Logistics hero');
const destDir = path.join(__dirname, 'public', 'logistics-hero');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
files.forEach(file => {
  const srcFile = path.join(srcDir, file);
  const destFile = path.join(destDir, file);
  fs.copyFileSync(srcFile, destFile);
});

console.log(`Successfully copied ${files.length} frames.`);
