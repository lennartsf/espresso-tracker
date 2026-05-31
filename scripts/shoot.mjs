import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE || 'http://localhost:5173'
const ids = process.argv.slice(2)
const targets = ids.length ? ids : ['v60', 'milk', 'latte-heart']
const SHOTS = [300, 1500, 3000, 4500, 6000, 7500]

mkdirSync('screenshots', { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 460, height: 950 } })

for (const id of targets) {
  await page.goto(`${BASE}/animate/${id}`, { waitUntil: 'networkidle' })
  const start = Date.now()
  for (const t of SHOTS) {
    const wait = t - (Date.now() - start)
    if (wait > 0) await page.waitForTimeout(wait)
    await page.screenshot({ path: `screenshots/${id}-${String(t).padStart(4, '0')}.png` })
  }
  console.log(`shot ${id}`)
}

await browser.close()
