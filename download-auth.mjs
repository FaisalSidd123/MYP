import fs from 'fs';
import https from 'https';

const files = [
  { name: 'signIn', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2QzOWU5ODM3NzE5MzQ2ZTBhMWI1MTRlNDkyNzY2NjFhEgsSBxDzjbXwug4YAZIBJAoKcHJvamVjdF9pZBIWQhQxMDg2OTgyODQ2Nzg1MzYxMjM0Mw&filename=&opi=96797242' },
  { name: 'signUp', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzI1NWZhZWZlMDEyMDRjNGQ4YTBmNzljZmIwYzdmNGNiEgsSBxDzjbXwug4YAZIBJAoKcHJvamVjdF9pZBIWQhQxMDg2OTgyODQ2Nzg1MzYxMjM0Mw&filename=&opi=96797242' },
];

fs.mkdirSync('d:/Contatct Manager/.stitch/designs', { recursive: true });

files.forEach(f => {
  https.get(f.url, (res) => {
    res.pipe(fs.createWriteStream(`d:/Contatct Manager/.stitch/designs/${f.name}.html`));
    console.log(`Downloaded ${f.name}`);
  });
});
