import fs from 'fs';
import path from 'path';

const pages = [
  { file: 'signIn.html', route: '(auth)/login/page.tsx', name: 'LoginPage' },
  { file: 'signUp.html', route: '(auth)/register/page.tsx', name: 'RegisterPage' }
];

function convertToJSX(htmlStr) {
  let jsx = htmlStr;
  
  jsx = jsx.replace(/class=/g, 'className=');
  jsx = jsx.replace(/for=/g, 'htmlFor=');
  jsx = jsx.replace(/stroke-width=/g, 'strokeWidth=');
  jsx = jsx.replace(/stroke-linecap=/g, 'strokeLinecap=');
  jsx = jsx.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
  
  jsx = jsx.replace(/<input([^>]*[^/])>/g, '<input$1 />');
  jsx = jsx.replace(/<img([^>]*[^/])>/g, '<img$1 />');
  jsx = jsx.replace(/<br([^>]*[^/])>/g, '<br$1 />');
  jsx = jsx.replace(/<hr([^>]*[^/])>/g, '<hr$1 />');

  jsx = jsx.replace(/style="([^"]*)"/g, (match, val) => {
    const parts = val.split(';').filter(Boolean);
    const rules = parts.map(p => {
      let [k, v] = p.split(':');
      if (!k || !v) return '';
      k = k.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      return `${k}: "${v.trim().replace(/"/g, "'")}"`;
    }).filter(Boolean).join(', ');
    return `style={{ ${rules} }}`;
  });

  jsx = jsx.replace(/<!--[\s\S]*?-->/g, '');

  return jsx;
}

for (const p of pages) {
  const htmlPath = `d:/Contatct Manager/.stitch/designs/${p.file}`;
  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    // Extract everything inside body
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
    let content = bodyMatch ? bodyMatch[1] : '';

    content = convertToJSX(content);

    const outPath = `d:/Contatct Manager/contacthub/src/app/${p.route}`;
    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    // Ensure we don't return adjacent JSX elements without a fragment if they're multiple root div nodes
    const complete = `import React from 'react';
import Link from 'next/link';

export default function ${p.name}() {
  return (
    <>
      ${content.replace(/href="#"/g, 'href="/"')}
    </>
  );
}
`;
    fs.writeFileSync(outPath, complete);
    console.log(`Generated ${outPath}`);
  }
}
