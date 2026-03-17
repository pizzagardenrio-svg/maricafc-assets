const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'app');
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.js')) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    let modified = false;
    if (content.includes("'../config/firebase'")) {
      content = content.replace(/'\.\.\/config\/firebase'/g, "'../src/config/firebase'");
      modified = true;
    }
    if (content.includes('"../config/firebase"')) {
      content = content.replace(/"\.\.\/config\/firebase"/g, '"../src/config/firebase"');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(fullPath, content);
      console.log('Fixed firebase imports in', file);
    }
  }
});
