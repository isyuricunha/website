import { describe, expect, it } from 'vitest'

import { getAnnouncementUi } from '#lib/announcement-ui'

describe('announcement ui helpers', () => {
  it('normalizes unknown types to info', () => {
    const ui = getAnnouncementUi('unknown-type')
    expect(ui.type).toBe('info')
    expect(ui.badgeClassName).toContain('text-status-info')
  })

  it('returns error styles for error', () => {
    const ui = getAnnouncementUi('error')
    expect(ui.type).toBe('error')
    expect(ui.badgeClassName).toContain('status-danger')
    expect(ui.iconContainerClassName).toContain('bg-status-danger')
    expect(ui.buttonClassName).toContain('text-status-danger')
  })

  it('supports extended types (maintenance/update/feature)', () => {
    const maintenance = getAnnouncementUi('maintenance')
    expect(maintenance.type).toBe('maintenance')
    expect(maintenance.badgeClassName).toContain('text-accent-gold')

    const update = getAnnouncementUi('update')
    expect(update.type).toBe('update')
    expect(update.badgeClassName).toContain('text-status-info')

    const feature = getAnnouncementUi('feature')
    expect(feature.type).toBe('feature')
    expect(feature.badgeClassName).toContain('text-status-agent')
  })
})
