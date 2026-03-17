const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'app');
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.js')) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    if (content.includes("'../components/")) {
      content = content.replace(/'\.\.\/components\//g, "'../src/components/");
      fs.writeFileSync(fullPath, content);
      console.log('Fixed imports in', file);
    }
  }
});
