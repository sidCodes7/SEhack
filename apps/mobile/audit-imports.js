const fs = require('fs');
const path = require('path');

const mobileRoot = 'c:/Users/Dev Gaglani/se-hack/SEhack/apps/mobile';
const appDir = path.join(mobileRoot, 'app');

// Extensions Metro tries to resolve
const EXTS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'];

function walk(dir) {
  let results = [];
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && !file.startsWith('node_modules') && !file.startsWith('.')) {
      results = results.concat(walk(full));
    } else if (/\.(tsx?|jsx?)$/.test(file)) {
      results.push(full);
    }
  }
  return results;
}

function canResolve(fromFile, importPath) {
  if (importPath.startsWith('.')) {
    const dir = path.dirname(fromFile);
    const target = path.resolve(dir, importPath);
    // Check as file with each extension
    for (const ext of EXTS) {
      if (fs.existsSync(target + ext)) return true;
    }
    // Check as directory with index
    for (const ext of EXTS) {
      if (fs.existsSync(path.join(target, 'index' + ext))) return true;
    }
    // Check exact path
    if (fs.existsSync(target)) return true;
    return false;
  }
  // Non-relative imports (node_modules) — skip
  return true;
}

console.log('=== COMPREHENSIVE IMPORT AUDIT ===\n');

const files = walk(appDir);
const broken = [];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match: import ... from '...' or import ... from "..."
    const match = line.match(/(?:import|from)\s+['"]([^'"]+)['"]/);
    if (match) {
      const importPath = match[1];
      if (importPath.startsWith('.') && !canResolve(f, importPath)) {
        const rel = path.relative(mobileRoot, f).replace(/\\/g, '/');
        broken.push({ file: rel, line: i + 1, import: importPath, fullPath: f });
        console.log(`BROKEN: ${rel}:${i+1}`);
        console.log(`  import: ${importPath}`);
        const dir = path.dirname(f);
        const resolved = path.resolve(dir, importPath);
        console.log(`  resolves to: ${path.relative(mobileRoot, resolved).replace(/\\/g, '/')}`);
        console.log('');
      }
    }
    // Also match require('...')
    const reqMatch = line.match(/require\(['"]([^'"]+)['"]\)/);
    if (reqMatch) {
      const importPath = reqMatch[1];
      if (importPath.startsWith('.') && !canResolve(f, importPath)) {
        const rel = path.relative(mobileRoot, f).replace(/\\/g, '/');
        broken.push({ file: rel, line: i + 1, import: importPath, fullPath: f });
        console.log(`BROKEN: ${rel}:${i+1}`);
        console.log(`  import: ${importPath}`);
        console.log('');
      }
    }
  }
}

console.log(`\n=== SUMMARY: ${broken.length} broken imports across ${new Set(broken.map(b => b.file)).size} files ===\n`);

// Group by what they're trying to import
const byTarget = {};
for (const b of broken) {
  const key = b.import.replace(/^(\.\.\/)+/, '');
  if (!byTarget[key]) byTarget[key] = [];
  byTarget[key].push(b);
}
for (const [target, items] of Object.entries(byTarget)) {
  console.log(`Module "${target}" — missing in ${items.length} file(s):`);
  for (const item of items) {
    console.log(`  ${item.file}:${item.line}`);
  }
  console.log('');
}
