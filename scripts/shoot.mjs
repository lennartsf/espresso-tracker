import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

// Screenshot the running animations and stitch the phases into one montage
// per animation, so a whole sequence can be reviewed in a single image.
const BASE = process.env.BASE || 'http://localhost:5173'
const ids = process.argv.slice(2)
const targets = ids.length ? ids : ['v60', 'milk', 'latte-heart']
const SHOTS = [300, 2200, 4200, 6200, 8200, 10000, 11500]
const TILE_W = 240
const GAP = 8

mkdirSync('screenshots', { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 460, height: 950 } })

for (const id of targets) {
  await page.goto(`${BASE}/animate/${id}`, { waitUntil: 'networkidle' })
  const start = Date.now()
  const frames = []
  for (const t of SHOTS) {
    const wait = t - (Date.now() - start)
    if (wait > 0) await page.waitForTimeout(wait)
    const buf = await page.screenshot({ path: `screenshots/${id}-${String(t).padStart(4, '0')}.png` })
    frames.push(await sharp(buf).resize({ width: TILE_W }).toBuffer())
  }
  const h = (await sharp(frames[0]).metadata()).height
  const canvasW = TILE_W * frames.length + GAP * (frames.length - 1)
  await sharp({ create: { width: canvasW, height: h, channels: 4, background: '#ffffff' } })
    .composite(frames.map((input, i) => ({ input, top: 0, left: i * (TILE_W + GAP) })))
    .png()
    .toFile(`screenshots/${id}-montage.png`)
  console.log(`shot ${id} -> screenshots/${id}-montage.png`)
}

await browser.close()
