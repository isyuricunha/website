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
        textPrimary: root.getPropertyValue('--text-primary').trim()
      }
    })

    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByTestId('theme-toggle')).toHaveCount(0)
    expect(theme).toEqual({
      accent: '#c9572a',
      background: 'rgb(20, 18, 11)',
      bgBase: '#14120b',
      textPrimary: '#f0ebe0'
    })
  })
})
