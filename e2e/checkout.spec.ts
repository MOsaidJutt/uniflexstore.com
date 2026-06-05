/**
 * E2E: Critical purchase path
 *
 * Prerequisites (set in .env.test or environment):
 *   TEST_USER_EMAIL    — existing seed account, e.g. alice@example.com
 *   TEST_USER_PASSWORD — Test@1234
 *   TEST_PRODUCT_SLUG  — a product slug in the DB, e.g. velocity-runner-v2
 *   STRIPE_TEST_CARD   — Stripe test card number (default: 4242424242424242)
 *
 * Run:
 *   npx playwright test e2e/checkout.spec.ts --headed
 *   npx playwright test e2e/checkout.spec.ts (CI headless)
 */

import { test, expect, type Page } from '@playwright/test'

const EMAIL    = process.env.TEST_USER_EMAIL    ?? 'alice@example.com'
const PASSWORD = process.env.TEST_USER_PASSWORD ?? 'Test@1234'
const SLUG     = process.env.TEST_PRODUCT_SLUG  ?? 'velocity-runner-v2'
const CARD     = process.env.STRIPE_TEST_CARD   ?? '4242424242424242'

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function login(page: Page) {
  await page.goto('/auth/login')
  await page.getByLabel(/email/i).fill(EMAIL)
  await page.getByLabel(/password/i).fill(PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()
  // Wait for redirect to complete
  await page.waitForURL((url) => !url.pathname.startsWith('/auth/login'), { timeout: 15_000 })
}

async function fillStripeFrame(page: Page, card: string) {
  // Stripe mounts iframes — locate by title attribute
  const cardFrame = page.frameLocator('iframe[title*="card number" i]').first()
  await cardFrame.locator('input').fill(card)

  const expFrame = page.frameLocator('iframe[title*="expiration" i]').first()
  await expFrame.locator('input').fill('12/29')

  const cvcFrame = page.frameLocator('iframe[title*="security" i]').first()
  await cvcFrame.locator('input').fill('123')
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Purchase path', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Homepage loads with hero and category grid', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('main')).toBeVisible()
    // Hero heading
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    // Category grid
    await expect(page.locator('a[href^="/categories/"]').first()).toBeVisible()
  })

  test('Product listing page shows products', async ({ page }) => {
    await page.goto('/products')
    await expect(page.getByRole('main')).toBeVisible()
    // At least one product card
    const cards = page.locator('article')
    await expect(cards.first()).toBeVisible()
  })

  test('Product detail page (PDP) renders', async ({ page }) => {
    await page.goto(`/products/${SLUG}`)
    // Breadcrumb
    await expect(page.getByRole('navigation', { name: /breadcrumb/i })).toBeVisible()
    // Product name H1
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
    // Add to cart button
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible()
    // Structured data present
    const jsonLd = page.locator('script[type="application/ld+json"]')
    await expect(jsonLd).toBeAttached()
  })

  test('Add to cart and open cart drawer', async ({ page }) => {
    await page.goto(`/products/${SLUG}`)
    await page.getByRole('button', { name: /add to cart/i }).click()
    // Cart drawer or toast confirmation
    await expect(
      page.getByRole('dialog', { name: /cart/i })
        .or(page.getByText(/added to cart/i))
        .or(page.getByRole('region', { name: /cart/i }))
    ).toBeVisible({ timeout: 8_000 })
  })

  test('Full checkout flow with Stripe test card', async ({ page }) => {
    // Ensure cart has an item
    await page.goto(`/products/${SLUG}`)
    await page.getByRole('button', { name: /add to cart/i }).click()
    await page.waitForTimeout(1_000)

    // Navigate to checkout
    await page.goto('/checkout')
    await expect(page.getByRole('main')).toBeVisible()

    // ── Address step ──────────────────────────────────────────────────────────
    await page.getByLabel(/first name/i).fill('Test')
    await page.getByLabel(/last name/i).fill('Buyer')
    await page.getByLabel(/address line 1/i).fill('123 Main St')
    await page.getByLabel(/city/i).fill('New York')
    // State select
    const stateSelect = page.getByLabel(/state/i)
    if (await stateSelect.isVisible()) {
      await stateSelect.selectOption('NY')
    }
    await page.getByLabel(/zip|postal/i).fill('10001')
    await page.getByLabel(/phone/i).fill('2125551234').catch(() => null) // optional

    await page.getByRole('button', { name: /continue|next|shipping/i }).click()

    // ── Shipping step ─────────────────────────────────────────────────────────
    // Select standard shipping if available
    const standardShipping = page.getByLabel(/standard/i)
    if (await standardShipping.isVisible()) {
      await standardShipping.check()
    }
    await page.getByRole('button', { name: /continue|next|payment/i }).click()

    // ── Payment step — Stripe Element ────────────────────────────────────────
    // Wait for Stripe iframe to mount
    await page.waitForSelector('iframe[title*="card" i]', { timeout: 15_000 })
    await fillStripeFrame(page, CARD)

    await page.getByRole('button', { name: /place order|pay|submit/i }).click()

    // ── Confirmation ──────────────────────────────────────────────────────────
    await page.waitForURL(/\/order\/.*\/confirmation/, { timeout: 30_000 })
    await expect(page.getByRole('heading', { name: /order confirmed|thank you/i })).toBeVisible()
    // Order ID should appear
    await expect(page.getByText(/#[A-Z0-9]{8}/)).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('Authentication', () => {
  test('Login page renders and rejects bad credentials', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByRole('heading', { name: /sign in|log in/i })).toBeVisible()

    await page.getByLabel(/email/i).fill('nobody@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText(/invalid|incorrect|check your/i)).toBeVisible({ timeout: 8_000 })
  })

  test('Protected /orders redirects guests to login', async ({ page }) => {
    await page.goto('/orders')
    await page.waitForURL(/\/auth\/login/, { timeout: 8_000 })
    await expect(page).toHaveURL(/next=\/orders/)
  })
})

test.describe('Accessibility', () => {
  test('Skip-to-main link is present and focusable', async ({ page }) => {
    await page.goto('/')
    const skipLink = page.getByRole('link', { name: /skip to main/i })
    await skipLink.focus()
    await expect(skipLink).toBeFocused()
    await expect(skipLink).toBeVisible()
  })

  test('No images with empty alt text on homepage', async ({ page }) => {
    await page.goto('/')
    const imagesWithEmptyAlt = await page.locator('img:not([alt])').count()
    expect(imagesWithEmptyAlt).toBe(0)
    // Decorative images should use aria-hidden, not empty alt
    const emptyAlt = await page.evaluate(() =>
      [...document.querySelectorAll('img[alt=""]')].filter(
        (img) => !img.closest('[aria-hidden="true"]')
      ).length
    )
    expect(emptyAlt).toBe(0)
  })
})

test.describe('SEO', () => {
  test('PDP has correct metadata', async ({ page }) => {
    await page.goto(`/products/${SLUG}`)
    // Title contains product name
    const title = await page.title()
    expect(title).toBeTruthy()
    expect(title.length).toBeGreaterThan(10)
    // OG tags present
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toBeTruthy()
    // Canonical
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toContain('/products/')
    // JSON-LD
    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all()
    expect(jsonLdScripts.length).toBeGreaterThan(0)
    const firstLd = JSON.parse(await jsonLdScripts[0].textContent() ?? '{}')
    expect(firstLd['@type']).toBe('Product')
  })

  test('Sitemap.xml is accessible', async ({ page }) => {
    const response = await page.request.get('/sitemap.xml')
    expect(response.status()).toBe(200)
    const body = await response.text()
    expect(body).toContain('<urlset')
    expect(body).toContain('/products/')
  })

  test('Robots.txt disallows admin', async ({ page }) => {
    const response = await page.request.get('/robots.txt')
    expect(response.status()).toBe(200)
    const body = await response.text()
    expect(body).toContain('Disallow: /admin/')
    expect(body).toContain('Sitemap:')
  })
})

test.describe('Security', () => {
  test('Security headers are present', async ({ page }) => {
    const response = await page.request.get('/')
    const headers = response.headers()
    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['strict-transport-security']).toContain('max-age=')
    expect(headers['content-security-policy']).toBeTruthy()
  })

  test('Admin pages require authentication', async ({ page }) => {
    const response = await page.request.get('/admin')
    // Should redirect (3xx) or return 401/403 — not 200
    expect(response.status()).not.toBe(200)
  })

  test('Chat action endpoint rejects unauthenticated requests', async ({ page }) => {
    const response = await page.request.post('/api/chat/action', {
      data: { action: 'cart_add', params: { productId: 'fake', quantity: 1 } },
      headers: { 'Content-Type': 'application/json' },
    })
    expect(response.status()).toBe(401)
  })
})
