import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const browser = await chromium.launch()
const m = await browser.newPage({ viewport: { width: 390, height: 844 } })

// Block any shot insert so a stray submit can't create a row; count attempts.
let inserts = 0
await m.route('**/rest/v1/shots**', route => {
  if (route.request().method() === 'POST') { inserts++; return route.abort() }
  return route.continue()
})

await m.goto(`${BASE}/app/shots/new`, { waitUntil: 'networkidle' })
await m.waitForTimeout(600)
const sel = m.locator('select').first()
const opts = await sel.locator('option').all()
if (opts.length > 1) await sel.selectOption(await opts[1].getAttribute('value'))
await m.waitForTimeout(200)

const next = async () => { await m.getByRole('button', { name: /^Next$/ }).click(); await m.waitForTimeout(300) }
await next()                                   // 0->1
await m.getByPlaceholder('12').fill('12')
await m.getByPlaceholder('18').fill('18')
await m.getByPlaceholder('36').fill('36')
await next()                                   // 1->2
await next()                                   // 2->3
await m.getByRole('button', { name: '8', exact: true }).first().click()
await next()                                   // 3->4  (the buggy transition)
await m.waitForTimeout(400)
console.log('after 3->4: url', m.url(), '| insert attempts', inserts)
await m.screenshot({ path: 'screenshots/step-final.png', fullPage: true })
await browser.close()
