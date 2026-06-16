import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE || 'http://localhost:5173'
mkdirSync('screenshots', { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

async function snap(name) {
  await page.waitForTimeout(800)
  await page.screenshot({ path: `screenshots/m-${name}.png`, fullPage: true })
  console.log(`-> screenshots/m-${name}.png`)
}

const routes = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['/app/shots/new', '/app/analysis', '/app/roasters', '/app/coffees', '/app/brews/new']

for (const r of routes) {
  await page.goto(`${BASE}${r}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await snap(r.replace(/\//g, '_').replace(/^_/, ''))
}

await browser.close()
