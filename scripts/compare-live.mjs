// Compara el HTML que entrega el sitio nuevo contra la captura de ford.cr
// (espacios colapsados y dominio normalizado). Uso: node scripts/compare-live.mjs <captura> <base-url>
import { readFileSync } from 'node:fs'
const [dir, base = 'http://localhost:3000'] = process.argv.slice(2)
const index = JSON.parse(readFileSync(`${dir}/pages.json`, 'utf8'))
const norm = (s) => s.replace(/src="[^"]*\/uploads\/(family|slides)\/[^"]*"/g, 'src=""').replace(/srcset="[^"]*\/uploads\/slides\/[^"]*"/g, 'srcset=""').replace(/https?:\/\/(www\.)?ford\.cr/g, '').replace(new RegExp(base.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'), 'g'), '').replace(/\s+/g, ' ').replace(/> </g, '><').trim()
let same = 0; const diff = []
const entries = Object.entries(index).filter(([, v]) => v.status === 200)
for (const [p, v] of entries) {
  const orig = readFileSync(`${dir}/html/${v.file}`, 'utf8')
  const res = await fetch(base + p, { redirect: 'manual' })
  const out = await res.text()
  if (res.status >= 300 && res.status < 400) { same++; continue }
  const A = norm(out), B = norm(orig)
  if (A === B) { same++; continue }
  let i = 0; while (i < A.length && A[i] === B[i]) i++
  diff.push({ p, status: res.status, at: i, orig: B.slice(Math.max(0, i - 80), i + 140), mine: A.slice(Math.max(0, i - 80), i + 140) })
}
console.log(`iguales: ${same}/${entries.length}`)
for (const d of diff.slice(0, Number(process.env.SHOW || 6))) console.log(`\n== ${d.p} [${d.status}] @${d.at}\n  ford.cr: ${d.orig}\n  nuevo  : ${d.mine}`)
const groups = {}; for (const d of diff) { const k = d.orig.slice(60, 120); groups[k] = (groups[k] || 0) + 1 }
console.log('\nagrupado:', Object.entries(groups).sort((a, b) => b[1] - a[1]).slice(0, 10))
