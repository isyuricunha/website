import { describe, expect, it } from 'vitest'

import { getAnnouncementUi } from '@/lib/announcement-ui'

describe('announcement ui helpers', () => {
  it('normalizes unknown types to info', async () => {
    const ui = getAnnouncementUi('unknown-type')
    expect(ui.type).toBe('info')
    expect(ui.badgeVariant).toBe('info')
  })

  it('returns error styles for error', async () => {
    const ui = getAnnouncementUi('error')
    expect(ui.type).toBe('error')
    expect(ui.badgeVariant).toBe('destructive')
    expect(ui.iconContainerClassName).toContain('bg-status-danger')
    expect(ui.buttonClassName).toContain('text-status-danger')
  })

  it('supports extended types (maintenance/update/feature)', async () => {
    const maintenance = getAnnouncementUi('maintenance')
    expect(maintenance.type).toBe('maintenance')
    expect(maintenance.badgeVariant).toBe('warning')

    const update = getAnnouncementUi('update')
    expect(update.type).toBe('update')
    expect(update.badgeVariant).toBe('info')

    const feature = getAnnouncementUi('feature')
    expect(feature.type).toBe('feature')
    expect(feature.badgeVariant).toBe('agent')
  })
})
