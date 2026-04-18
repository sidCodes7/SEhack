const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('c:/Users/Dev Gaglani/se-hack/SEhack/apps/mobile/app');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // fix 1: await async () => (await api.get("/..."))
  content = content.replace(/await async \(\) => \(await api\.get\("([^"]+)"\)\)\.data\.data\(\)/g, '(await api.get("$1")).data.data');

  // fix 2: await async (id, note) => (await api.post(...)).data(id...)
  content = content.replace(/await async \([^)]*\) => \(await api\.post\(([^,]+),\s*\{[^}]*\}\)\)\.data\([^)]*\)/g, '(await api.post($1, { note }))');
  
  // generic fix for any remaining "await async (args) => (await api.method(url, args)).data(args)"
  content = content.replace(/await async \([^)]*\) => \(await (api\.[a-z]+\([^)]+\))\)\.data(?:\.data)?\([^)]*\)/g, '(await $1).data');

  // fallback generic for pyq
  content = content.replace(/await async \([^)]*\) => \(await api\.get\(`([^`]+)`\)\)\.data\.data\([^)]*\)/g, '(await api.get(`$1`)).data.data');

  // issues heatmap
  content = content.replace(/await async \(\) => \(await api\.get\("([^"]+)"\)\)\.data\.data/g, '(await api.get("$1")).data.data');

  // Just strip out the wrapper entirely
  content = content.replace(/await async \([^)]*\) => /g, 'await ');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed:', f);
  }
});
