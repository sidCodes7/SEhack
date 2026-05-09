const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) results = results.concat(walk(file));
      else if (file.endsWith('.jsx')) results.push(file);
    });
  } catch(e){}
  return results;
}

const files = walk('src/components');

files.forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  let changed = false;
  
  const replacements = [
    { regex: /✅/g, icon: 'Check', repl: '<Check size={16} />' },
    { regex: /❌/g, icon: 'X', repl: '<X size={16} />' },
    { regex: /✕/g, icon: 'X', repl: '<X size={20} />' },
    { regex: /⚠️/g, icon: 'AlertTriangle', repl: '<AlertTriangle size={32} />' },
    { regex: /⚙️/g, icon: 'Settings', repl: '<Settings size={20} />' },
    { regex: /▲/g, icon: 'ChevronUp', repl: '<ChevronUp size={16} />' },
    { regex: /▼/g, icon: 'ChevronDown', repl: '<ChevronDown size={16} />' },
    { regex: /→/g, icon: 'ArrowRight', repl: '<ArrowRight size={16} />' },
    { regex: /▶/g, icon: 'Send', repl: '<Send size={16} />' },
    { regex: /⚖️/g, icon: 'Scale', repl: '<Scale size={16} />' },
    { regex: /■/g, icon: 'Square', repl: '<Square size={16} />' }
  ];

  let neededIcons = new Set();
  
  // if Header, skip some to avoid double imports since we did it manually
  if (f.includes('Header.jsx')) return;

  replacements.forEach(r => {
    if (r.regex.test(code)) {
      changed = true;
      neededIcons.add(r.icon);
      code = code.replace(r.regex, r.repl);
    }
  });

  if (changed) {
    const icons = Array.from(neededIcons).join(', ');
    const importStmt = "import { " + icons + " } from 'lucide-react';\n";
    code = importStmt + code;
    fs.writeFileSync(f, code);
  }
});
