import { describe, expect, it } from 'vitest'

import { getAnnouncementUi } from '@/lib/announcement-ui'

describe('announcement ui helpers', () => {
  it('normalizes unknown types to info', async () => {
    const ui = getAnnouncementUi('unknown-type')
    expect(ui.type).toBe('info')
    expect(ui.badgeVariant).toBe('outline')
  })

  it('returns error styles for error', async () => {
    const ui = getAnnouncementUi('error')
    expect(ui.type).toBe('error')
    expect(ui.badgeVariant).toBe('destructive')
    expect(ui.iconContainerClassName).toContain('bg-destructive')
    expect(ui.buttonClassName).toContain('text-destructive')
  })

  it('supports extended types (maintenance/update/feature)', async () => {
    const maintenance = getAnnouncementUi('maintenance')
    expect(maintenance.type).toBe('maintenance')
    expect(maintenance.badgeVariant).toBe('secondary')

    const update = getAnnouncementUi('update')
    expect(update.type).toBe('update')
    expect(update.badgeVariant).toBe('outline')

    const feature = getAnnouncementUi('feature')
    expect(feature.type).toBe('feature')
    expect(feature.badgeVariant).toBe('secondary')
  })
})
