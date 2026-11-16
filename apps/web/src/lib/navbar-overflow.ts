type CalculateVisibleCountArgs = {
  availableWidth: number
  itemWidths: number[]
  moreWidth: number
  gapPx: number
}

// Same overflow algorithm as the Next.js navbar: how many links fit before a
// "more" dropdown is needed.
export const calculate_visible_count = (args: CalculateVisibleCountArgs): number => {
  const { availableWidth, itemWidths, moreWidth, gapPx } = args

  if (itemWidths.length === 0) {
    return 0
  }

  const totalAll =
    itemWidths.reduce((acc, w) => acc + w, 0) + gapPx * Math.max(0, itemWidths.length - 1)

  if (totalAll <= availableWidth) {
    return itemWidths.length
  }

  for (let visibleCount = itemWidths.length - 1; visibleCount >= 0; visibleCount -= 1) {
    const visibleWidth =
      itemWidths.slice(0, visibleCount).reduce((acc, w) => acc + w, 0) +
      gapPx * Math.max(0, visibleCount - 1)

    const totalWithMore = visibleWidth + (visibleCount > 0 ? gapPx : 0) + moreWidth

    if (totalWithMore <= availableWidth) {
      return visibleCount
    }
  }

  return 0
}
