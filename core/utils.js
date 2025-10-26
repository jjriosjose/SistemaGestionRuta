
// utils.js
export function parseCSV(text){
  const rows = []; let r = 0, c = 0, i = 0, cur = '', inQ = false, row = [];
  while(i < text.length){
    const ch = text[i], nx = text[i+1];
    if(inQ){
      if(ch === '"' && nx === '"'){ cur += '"'; i++; }
      else if(ch === '"'){ inQ = false; }
      else cur += ch;
    }else{
      if(ch === '"'){ inQ = true; }
      else if(ch === ','){ row.push(cur); cur=''; c++; }
      else if(ch === '
'){ row.push(cur); rows.push(row); row=[]; cur=''; r++; c=0; }
      else if(ch === ''){ /* ignore */ }
      else cur += ch;
    }
    i++;
  }
  if(cur.length || row.length) { row.push(cur); rows.push(row); }
  if(!rows.length) return [];
  const headers = rows[0].map(h => String(h||'').trim());
  return rows.slice(1).map(r => Object.fromEntries(headers.map((h,idx)=>[h, (r[idx]??'').trim()])));
}
export const norm = s => (s==null?'':String(s)).trim();
export const nrmU = s => norm(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
export const nkey = s => nrmU(s).replace(/\s+|_/g,'');
export const by = k => (a,b)=> String(a[k]||'').localeCompare(String(b[k]||''),'es',{numeric:true});
export const sum = a => a.reduce((x,y)=>x+(+y||0),0);
export function weekNum(s){
  const m = String(s||'').match(/\d+/); return m? m[0] : String(s||'');
}
