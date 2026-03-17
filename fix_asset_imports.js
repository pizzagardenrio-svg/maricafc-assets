const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'app');
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.js')) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    let modified = false;
    // Replace ../../assets with ../assets
    if (content.includes('../../assets/')) {
      content = content.replace(/\.\.\/\.\.\/assets\//g, '../assets/');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(fullPath, content);
      console.log('Fixed asset imports in', file);
    }
  }
});
