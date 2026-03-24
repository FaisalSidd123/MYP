import fs from 'fs';

const html = fs.readFileSync('d:/Contatct Manager/.stitch/designs/dashboard.html', 'utf8');
const match = html.match(/colors:\s*({[\s\S]*?}),\n\s*fontFamily/);
if (match) {
  let colorsStr = match[1];
  let colorsObj;
  // safely evaluate the object
  eval(`colorsObj = ${colorsStr}`);
  
  let css = `@import "tailwindcss";\n\n@theme inline {\n`;
  for (const [key, val] of Object.entries(colorsObj)) {
    css += `  --color-${key}: ${val};\n`;
  }
  css += `
  --font-headline: "Inter", sans-serif;
  --font-body: "Inter", sans-serif;
  --font-label: "Inter", sans-serif;
}\n
body {
  background-color: var(--color-background);
  color: var(--color-on-background);
  font-family: var(--font-body);
}

.glass-card {
    background: rgba(28, 37, 62, 0.4);
    backdrop-filter: blur(20px);
    box-shadow: 0 20px 40px -12px rgba(7, 13, 31, 0.5), 0 0 15px rgba(163, 166, 255, 0.05);
}
.primary-gradient {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dim) 100%);
}
.activity-line {
    background: linear-gradient(to bottom, var(--color-primary) 0%, transparent 100%);
}
.ghost-border {
    border: 1px solid rgba(65, 71, 91, 0.15);
}
`;
  fs.writeFileSync('d:/Contatct Manager/contacthub/src/app/globals.css', css);
  console.log('Successfully updated globals.css');
} else {
  console.log('Regex match failed.');
}
