// Verificación offline: parsea cada página capturada y la vuelve a armar con la
// plantilla; compara contra el original (el menú se compara normalizando espacios).
import { readFileSync, readdirSync } from 'node:fs'
import { parsePage } from '../src/import/parse'
import shell from '../src/site/shell.json'
import defaults from '../src/import/settings-defaults.json'
import { esc } from '../src/site/html'

const dir = process.argv[2]
let ok = 0, raw = 0
const bad: string[] = []
for (const f of readdirSync(dir)) {
  const html = readFileSync(`${dir}/${f}`, 'utf8')
  if (!html.includes('<body')) continue
  const p = parsePage(html)
  if (p.template === 'raw') { raw++; continue }
  const v = '1775667654984'
  const out = shell.docStart +
    '\n    <meta charset="utf-8">\n    <meta http-equiv="X-UA-Compatible" content="IE=edge">\n    <meta name=viewport content="width=device-width, initial-scale=1">\n' +
    p.metaHtml + defaults.headScripts + '<title>\n            ' + esc(p.title) + '        ' + shell.titleCloseToTheme + p.headStyles +
    shell.cssBlock.replaceAll('{{v}}', v) + p.headCustom + shell.headCloseToBody + `<body class="${esc(p.bodyClass)}">` +
    defaults.bodyStartHtml + p.seoH1 + p.chrome + p.content + defaults.footerHtml + shell.spinner + shell.mainJs.replaceAll('{{v}}', v) +
    `
        <script>
            var route = "${esc(p.route)}";
            var enviroment = "prod" === "dev"? "/app_dev.php":"";
        </script>` + p.scripts + (p.tail || defaults.bodyEndScripts) + shell.docEnd
  const n = (s: string) => s.replace(/\s+/g, " ")
  const A = n(out), B = n(html)
  if (A === B) ok++
  else {
    let i = 0
    while (i < A.length && A[i] === B[i]) i++
    bad.push(`${f} @${i}: ${JSON.stringify(B.slice(i - 60, i + 100))}\n   vs ${JSON.stringify(A.slice(i - 60, i + 100))}`)
  }
}
console.log({ ok, raw, bad: bad.length })
console.log(bad.slice(0, 8).join('\n'))
