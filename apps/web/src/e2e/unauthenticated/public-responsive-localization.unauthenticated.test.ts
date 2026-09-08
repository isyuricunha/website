import { expect, test } from '@playwright/test'

const mobileViewport = { width: 375, height: 812 }

const expectNoPageOverflow = async (page: import('@playwright/test').Page) => {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
      )
    )
    .toBe(true)
}

test.describe('public responsive and localized routes', () => {
  test('localizes the Portuguese blog RSS link exactly once', async ({ page }) => {
    await page.setViewportSize(mobileViewport)
    await page.goto('/pt/blog')

    await expect(page.getByRole('link', { name: /RSS/i })).toHaveAttribute('href', '/pt/rss.xml')
  })

  test('keeps blog pagination within the mobile viewport', async ({ page }) => {
    await page.setViewportSize(mobileViewport)
    await page.goto('/blog')

    await expect(page.locator('main')).toBeVisible()
    await expectNoPageOverflow(page)
  })

  test('keeps the music top artists grid within the mobile viewport', async ({ page }) => {
    await page.setViewportSize(mobileViewport)
    await page.goto('/music')

    await expect(page.locator('main')).toBeVisible()
    await expectNoPageOverflow(page)
  })

  test('renders the Portuguese 404 in Portuguese without mobile overflow', async ({ page }) => {
    await page.setViewportSize(mobileViewport)
    await page.goto('/pt/this-page-does-not-exist')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Nenhuma página por aqui hoje!'
    )
    await expect(
      page.getByRole('main').getByRole('link', { name: 'Mapa do Site' })
    ).toHaveAttribute('href', '/pt/sitemap')
    await expectNoPageOverflow(page)
  })
})
