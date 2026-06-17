import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = 'http://localhost:5173'
mkdirSync('screenshots', { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } })

// 1. Logged-out /app → redirect to /login
await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
console.log('1) /app while logged out → url:', page.url())
await page.screenshot({ path: 'screenshots/auth-1-login.png', fullPage: true })

// 2. Sign up a throwaway account
const email = `phase2-verify-${Date.now()}@example.com`
const password = 'Test1234!pw'
await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' })
await page.getByPlaceholder('you@example.com').fill(email)
await page.getByPlaceholder('••••••••').fill(password)
await page.getByRole('button', { name: /sign up/i }).first().click()
await page.waitForTimeout(2500)
console.log('2) after signup → url:', page.url(), '| test email:', email)
await page.screenshot({ path: 'screenshots/auth-2-app-empty.png', fullPage: true })

await browser.close()
