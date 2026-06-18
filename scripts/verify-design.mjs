import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = 'http://localhost:5173'
mkdirSync('screenshots', { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

// sign up throwaway (RLS-safe, empty account)
const email = `design-verify-${Date.now()}@example.com`
await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' })
await page.getByPlaceholder('you@example.com').fill(email)
await page.getByPlaceholder('••••••••').fill('Test1234!pw')
await page.getByRole('button', { name: /sign up/i }).first().click()
await page.waitForTimeout(2500)
console.log('signup → url', page.url(), '| email', email)

// 1. Dashboard — no arc near New Shot, dark top
await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
await page.waitForTimeout(900)
await page.screenshot({ path: 'screenshots/d-dashboard.png' })

// 2. More menu fully expanded
await page.getByRole('button', { name: /^More$/ }).click()
await page.waitForTimeout(500)
await page.screenshot({ path: 'screenshots/d-more.png' })
await page.keyboard.press('Escape').catch(() => {})
await page.mouse.click(10, 400) // close overlay

// 3. New Shot steps — milk drink to see milk step
await page.goto(`${BASE}/app/shots/new`, { waitUntil: 'networkidle' })
await page.waitForTimeout(700)
await page.getByRole('button', { name: 'Cappuccino' }).click() // milk drink → milk step appears
await page.screenshot({ path: 'screenshots/d-step1-coffee.png' })
const next = async (tag) => {
  await page.getByRole('button', { name: /^Next$/ }).click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `screenshots/d-${tag}.png` })
}
// empty account → create a coffee inline via "+ New"
await page.getByRole('button', { name: '+ New' }).click()
await page.getByPlaceholder('Coffee name').fill('Test Coffee')
await next('step2-prep')
await page.getByPlaceholder('12', { exact: true }).fill('12')  // grind required
await next('step3-pull')
await next('step4-milk')
await next('step5-rate')
console.log('done')
await browser.close()
