const fs = require('fs');
const path = require('path');

const filesToFix = [
  'CardProximoJogo.js',
  'CardParceiro.js',
  'CardClube.js',
  'BannerPromo.js'
];

const componentsDir = path.join(__dirname, 'src', 'components');

filesToFix.forEach(file => {
  const fullPath = path.join(componentsDir, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // The exact string we found in grep
    const badString = ` if ($args[0].Groups[2].Value -match 'navigation') { "export default function " + $args[0].Groups[1].Value + "(" + ($args[0].Groups[2].Value -replace ',\\s*navigation', '' -replace 'navigation,\\s*', '' -replace '\\{navigation\\}', '') + ") {\`n  const router = useRouter();" } else { $args[0].Value }  {`;
    
    if (content.includes(badString)) {
      const componentName = file.replace('.js', '');
      const cleanExport = `export default function ${componentName}() {`;
      
      content = content.replace(badString, cleanExport);
      fs.writeFileSync(fullPath, content);
      console.log('Fixed', file);
    } else {
      console.log('Bad string not found verbatim in', file);
    }
  }
});
