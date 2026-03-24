import fs from 'fs';
import path from 'path';

const pages = [
  { file: 'contactsList.html', route: 'contacts/page.tsx', name: 'ContactsPage' },
  { file: 'contactProfile.html', route: 'contacts/[id]/page.tsx', name: 'ContactProfilePage' },
  { file: 'schedule.html', route: 'schedule/page.tsx', name: 'SchedulePage' },
  { file: 'kanban.html', route: 'tasks/page.tsx', name: 'TasksPage' },
];

function convertToJSX(htmlStr) {
  let jsx = htmlStr;
  
  // class to className
  jsx = jsx.replace(/class=/g, 'className=');
  jsx = jsx.replace(/for=/g, 'htmlFor=');
  jsx = jsx.replace(/stroke-width=/g, 'strokeWidth=');
  jsx = jsx.replace(/stroke-linecap=/g, 'strokeLinecap=');
  jsx = jsx.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
  
  // self closing tags
  jsx = jsx.replace(/<input([^>]*[^/])>/g, '<input$1 />');
  jsx = jsx.replace(/<img([^>]*[^/])>/g, '<img$1 />');
  jsx = jsx.replace(/<br([^>]*[^/])>/g, '<br$1 />');
  jsx = jsx.replace(/<hr([^>]*[^/])>/g, '<hr$1 />');

  // style tags
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

  // HTML comments
  jsx = jsx.replace(/<!--[\s\S]*?-->/g, '');

  return jsx;
}

for (const p of pages) {
  const htmlPath = `d:/Contatct Manager/.stitch/designs/${p.file}`;
  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
    let content = mainMatch ? mainMatch[1] : '';

    // Append FAB if exists
    const fabMatch = html.match(/(<button[^>]*fixed[^>]*>[\s\S]*?<\/button>)/);
    if (fabMatch) {
       content += '\n\n' + fabMatch[1];
    }

    content = convertToJSX(content);

    const outPath = `d:/Contatct Manager/contacthub/src/app/${p.route}`;
    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    const complete = `import React from 'react';

export default function ${p.name}() {
  return (
    <>
      ${content}
    </>
  );
}
`;
    fs.writeFileSync(outPath, complete);
    console.log(`Generated ${outPath}`);
  }
}
