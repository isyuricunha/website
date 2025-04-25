import type { Locator } from '@playwright/test'

export const getNumberFlow = async (locator: Locator) => {
  // @ts-expect-error -- internal property

  const ariaLabel = await locator.evaluate((flow) => flow._internals.ariaLabel)

  return ariaLabel
}
