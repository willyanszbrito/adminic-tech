const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[Build] 1/3: Installing frontend dependencies...');
execSync('npm install', { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });

console.log('[Build] 2/3: Building frontend with Vite...');
execSync('npm run build', { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });

console.log('[Build] 3/3: Copying frontend/dist to root dist...');
const srcDist = path.join(__dirname, 'frontend', 'dist');
const targetDist = path.join(__dirname, 'dist');

if (!fs.existsSync(targetDist)) {
  fs.mkdirSync(targetDist, { recursive: true });
}

fs.cpSync(srcDist, targetDist, { recursive: true, force: true });
console.log('[Build] Done! dist directory is ready for Cloudflare Workers Static Assets deployment.');
