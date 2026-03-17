const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');
const files = fs.readdirSync(componentsDir);

files.forEach(file => {
  if (file.endsWith('.js')) {
    const fullPath = path.join(componentsDir, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // The malicious regex string that was injected by mistake
    const badRegex = /if \(\$args\[0\]\.Groups\[2\]\.Value -match 'navigation'\) \{ "export default function " \+ \$args\[0\]\.Groups\[1\]\.Value \+ "\(" \+ \(\$args\[0\]\.Groups\[2\]\.Value -replace ',\\s\*navigation', '' -replace 'navigation,\\s\*', '' -replace '\\{navigation\\}', ''\) \+ "\) \{`n  const router = useRouter\(\);" \} else \{ \$args\[0\]\.Value \}  \{/g;

    if (content.match(badRegex)) {
      // We extract the function name to restore it based on the component's file name
      const componentName = file.replace('.js', '');
      const cleanExport = `export default function ${componentName}() { \n  const router = useRouter();`;
      
      content = content.replace(badRegex, cleanExport);
      fs.writeFileSync(fullPath, content);
      console.log('Purged powershell syntax from', file);
    }
  }
});
