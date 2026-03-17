const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'app');
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.js')) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    let changed = false;
    // Fix 1: duplicated useRouter with extra brace
    if (content.match(/^[ \t]*const router = useRouter\(\);\r?\n[ \t]*const router = useRouter\(\); \{/m)) {
      content = content.replace(/([ \t]*const router = useRouter\(\);)\r?\n[ \t]*const router = useRouter\(\); \{/m, '$1');
      changed = true;
      console.log('Fixed', file, '(brace)');
    }
    // Fix 2: just duplicated useRouter with or without trailing things, if the brace didn't match
    else if (content.match(/^[ \t]*const router = useRouter\(\);\r?\n[ \t]*const router = useRouter\(\);/m)) {
      content = content.replace(/([ \t]*const router = useRouter\(\);)\r?\n[ \t]*const router = useRouter\(\);/m, '$1');
      changed = true;
      console.log('Fixed', file, '(duplicate)');
    }

    if (changed) {
      fs.writeFileSync(fullPath, content);
    }
  }
});
