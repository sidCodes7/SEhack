const fs = require('fs');
const path = require('path');

const appDir = 'c:/Users/Dev Gaglani/se-hack/SEhack/apps/mobile/app';
const servicesDir = 'c:/Users/Dev Gaglani/se-hack/SEhack/apps/mobile/services';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(full));
    } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk(appDir);
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  const original = content;
  
  // Calculate the correct relative path from this file to services/api
  const fileDir = path.dirname(f);
  const rel = path.relative(fileDir, servicesDir).replace(/\\/g, '/');
  const correctImport = rel + '/api';
  
  // Replace any wrong import path to services/api
  content = content.replace(
    /from ['"]([^'"]*services\/api)['"]/g,
    `from '${correctImport}'`
  );
  
  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log(`Fixed: ${path.basename(f)} -> ${correctImport}`);
  }
});
console.log('Done!');
