import { expect, test } from '@playwright/test'

test.describe('theme', () => {
  test('should render the fixed warm theme shell', async ({ page }) => {
    await page.goto('/')

    const theme = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement)
      const body = getComputedStyle(document.body)

      return {
        accent: root.getPropertyValue('--accent').trim(),
        background: body.backgroundColor,
        bgBase: root.getPropertyValue('--bg-base').trim(),
        themeName: document.documentElement.dataset.theme,
        textPrimary: root.getPropertyValue('--text-primary').trim()
      }
    })

    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByTestId('theme-toggle')).toHaveCount(0)
    expect(theme).toEqual({
      accent: '#d6a84f',
      background: 'rgb(26, 24, 19)',
      bgBase: '#1a1813',
      themeName: 'yu-dark',
      textPrimary: '#f4f1e8'
    })
  })
})
