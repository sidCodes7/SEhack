const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8081,
  path: '/apps/mobile/node_modules/expo-router/entry.bundle?platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.routerRoot=app&minify=false&transform.bytecode=0',
  method: 'GET',
};

let body = '';
const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Bundle size:', body.length, 'bytes');
    
    // Metro uses __d(function, moduleId, dependencyMap, modulePath) format
    // Or paths appear in //# sourceURL= comments
    const sourceURLs = body.match(/\/\/# sourceURL=([^\n]+)/g) || [];
    const reactSources = sourceURLs.filter(s => 
      s.includes('/react/') && 
      !s.includes('react-native') && 
      !s.includes('react-dom') && 
      !s.includes('react-devtools') &&
      !s.includes('react-is') &&
      !s.includes('react-refresh')
    );
    
    console.log('\n=== React sourceURL entries ===');
    reactSources.forEach(s => console.log(' ', s));
    
    // Also look for __d() with react paths
    const defs = body.match(/__d\(function[^{]*\{/g) || [];
    console.log('\nTotal module definitions:', defs.length);

    // Search for the string "react/cjs" to find react bundles
    const cjsMatches = [];
    let idx = 0;
    while ((idx = body.indexOf('react/cjs', idx)) !== -1) {
      const context = body.substring(Math.max(0, idx - 80), Math.min(body.length, idx + 60));
      const clean = context.replace(/\n/g, ' ').trim();
      cjsMatches.push(clean);
      idx += 10;
    }
    console.log('\n=== "react/cjs" occurrences ===');
    const unique = [...new Set(cjsMatches)];
    unique.forEach(s => console.log(' ', s));
    console.log(`Total: ${cjsMatches.length} occurrences, ${unique.length} unique`);
  });
});

req.setTimeout(180000);
req.on('error', (e) => console.log('Error:', e.message));
req.end();
