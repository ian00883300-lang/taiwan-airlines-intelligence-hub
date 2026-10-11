import fs from 'node:fs';
for(const p of ['src/style.css','src/research.css']){
 const s=fs.readFileSync(p,'utf8').replace(/font-size:\s*([\d.]+)px/g,(_,n)=>`font-size: ${Number((Number(n)/14).toFixed(6))}rem`);
 fs.writeFileSync(p,s);
}
