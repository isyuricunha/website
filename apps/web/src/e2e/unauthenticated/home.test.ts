import { test } from '@playwright/test'

import { a11y } from '../utils/a11y'
import { scrollToBottom } from '../utils/scroll-to-bottom'

test.describe('homepage', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/')
    await scrollToBottom(page)

    await a11y({ page })
  })
})
