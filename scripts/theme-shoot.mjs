import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

// Fotografiert die Entwickler-Vorschau (preview.html) in beiden Themes und
// stellt sie nebeneinander. Die App selbst ist nicht fotografierbar: /app/*
// haengt hinter ProtectedRoute und braucht Supabase-Zugangsdaten.
const BASE = process.env.BASE || 'http://localhost:5173'
const WIDTH = 900
const GAP = 16

mkdirSync('screenshots', { recursive: true })

const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined })
const page = await browser.newPage({ viewport: { width: WIDTH, height: 1200 }, deviceScaleFactor: 2 })

const shots = []
for (const theme of ['dark', 'light']) {
  await page.goto(`${BASE}/preview.html?theme=${theme}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)          // CountUp + GSAP ausklingen lassen
  const buf = await page.screenshot({ fullPage: true })
  shots.push({ theme, buf })
  await sharp(buf).toFile(`screenshots/theme-${theme}.png`)
}
await browser.close()

// Montage nebeneinander
const metas = await Promise.all(shots.map(s => sharp(s.buf).metadata()))
const h = Math.max(...metas.map(m => m.height))
const w = metas.reduce((a, m) => a + m.width, 0) + GAP
await sharp({ create: { width: w, height: h, channels: 4, background: { r: 120, g: 120, b: 120, alpha: 1 } } })
  .composite(shots.map((s, i) => ({ input: s.buf, left: i === 0 ? 0 : metas[0].width + GAP, top: 0 })))
  .png()
  .toFile('screenshots/theme-montage.png')

console.log('screenshots/theme-dark.png, theme-light.png, theme-montage.png')
