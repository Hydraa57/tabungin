export function download(filename, text){
  const blob=new Blob([text],{type:'text/plain;charset=utf-8'})
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click()
  URL.revokeObjectURL(url); a.remove()
}
export function toCSV(rows){
  if(!rows.length) return ''
  const headers=Object.keys(rows[0])
  const lines=[headers.join(',')]
  for(const r of rows){ lines.push(headers.map(h=>JSON.stringify(r[h]??'')).join(',')) }
  return lines.join('\n')
}