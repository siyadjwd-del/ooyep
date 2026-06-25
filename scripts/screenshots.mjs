// Capture screenshots of the running portal for documentation.
//
// Usage:
//   1. Start the dev server:  npm run dev
//   2. In another terminal:   npm run screenshots
//
// Images are written to screenshots/. Uses playwright-core with the
// system Chromium (set CHROMIUM_PATH to override the executable).

import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const OUT = new URL('../screenshots/', import.meta.url).pathname
const BASE = process.env.BASE_URL || 'http://localhost:5173'
const EXEC =
  process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({
  executablePath: EXEC,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const page = await (
  await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
).newPage()

async function shot(name) {
  await page.mouse.move(5, 5) // park cursor so no tooltip/hover shows
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}${name}.png`, fullPage: true })
  console.log('saved', `${name}.png`)
}

// 1) Login
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
await shot('01-login')

// 2) Dashboard — log in, then wait until every chart has actually painted
await page.fill('input[type="email"]', 'demo@sitinvest.com')
await page.fill('input[type="password"]', 'demo1234')
await page.click('button[type="submit"]')
await page.waitForSelector('.banner', { timeout: 15000 })
await page
  .waitForFunction(
    () => {
      const area = document.querySelector('.recharts-area-area')
      const pie = document.querySelectorAll('.recharts-pie-sector')
      const bars = document.querySelectorAll('.recharts-bar-rectangle')
      const d = area && area.getAttribute('d')
      return d && d.length > 20 && pie.length >= 4 && bars.length >= 5
    },
    { timeout: 15000 },
  )
  .catch(() => {})
await page.waitForTimeout(1500)
await shot('02-dashboard')

// 3..6) Remaining pages — click the sidebar (client-side nav keeps the session)
const tabs = [
  ['03-holdings', 'Holdings', '.data-table tbody tr'],
  ['04-income', 'Income', '.coupon-list'],
  ['05-documents', 'Documents', '.doc-grid'],
  ['06-messages', 'Messages', '.chat-thread .bubble'],
]
for (const [name, label, sel] of tabs) {
  await page.click(`a.nav-item:has-text("${label}")`)
  await page.waitForSelector(sel, { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(1000)
  await shot(name)
}

await browser.close()
console.log('done')
