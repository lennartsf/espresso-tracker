import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE || 'http://localhost:5173'
mkdirSync('screenshots', { recursive: true })

const browser = await chromium.launch()

// desktop
const page = await browser.newPage({ viewport: { width: 1280, height: 1400 } })
await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
await page.screenshot({ path: 'screenshots/verify-dashboard-desktop.png', fullPage: true })
console.log('-> screenshots/verify-dashboard-desktop.png')

// mobile
const m = await browser.newPage({ viewport: { width: 390, height: 1600 } })
await m.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
await m.waitForTimeout(1500)
await m.screenshot({ path: 'screenshots/verify-dashboard-mobile.png', fullPage: true })
console.log('-> screenshots/verify-dashboard-mobile.png')

await browser.close()
