import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE || 'http://localhost:5173'
mkdirSync('screenshots', { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 1400 } })

async function snap(name) {
  await page.waitForTimeout(700)
  await page.screenshot({ path: `screenshots/verify-${name}.png`, fullPage: true })
  console.log(`-> screenshots/verify-${name}.png`)
}

// 1. App home — sidebar nav (confirm Animate gone)
await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
await snap('nav-home')
const navText = await page.locator('nav, aside').first().innerText().catch(() => '')
console.log('NAV CONTAINS ANIMATE:', /animate/i.test(navText))

// 2. Roasters — dark map
await page.goto(`${BASE}/app/roasters`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500) // tiles load
await snap('roasters-map')

// 3. Shots list -> first detail
await page.goto(`${BASE}/app/shots`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
const shotSel = 'a[href*="/app/shots/"]:not([href$="/new"])'
const firstShot = page.locator(shotSel).first()
const count = await page.locator(shotSel).count()
console.log('SHOT LINKS FOUND:', count)
if (count > 0) {
  const href = await firstShot.getAttribute('href')
  console.log('OPENING:', href)
  await page.goto(`${BASE}${href}`, { waitUntil: 'networkidle' })
  await snap('shotdetail-view')
  // find Edit button
  const editBtn = page.getByRole('button', { name: /edit/i }).first()
  const hasEdit = await editBtn.count()
  console.log('EDIT BUTTON:', hasEdit)
  if (hasEdit > 0) {
    await editBtn.click()
    await snap('shotdetail-edit')
  }
} else {
  console.log('NO SHOTS IN DB — cannot verify ShotDetail')
}

await browser.close()
