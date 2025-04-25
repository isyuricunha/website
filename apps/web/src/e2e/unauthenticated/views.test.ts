import { expect, test } from '@playwright/test'

test.describe('views', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog/test-view')
  })

  test('should be able to view a post', async ({ page }) => {
    const viewCount = page.getByTestId('view-count')

    await expect(async () => {
      // @ts-expect-error -- internal property

      const ariaLabel = await viewCount.evaluate((flow) => flow._internals.ariaLabel)
      expect(ariaLabel).toBe('1')
    }).toPass({ timeout: 5000 })
  })
})
