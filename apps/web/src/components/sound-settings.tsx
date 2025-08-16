'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { Button } from '@tszhong0411/ui'
import { Switch } from '@tszhong0411/ui'
import { Slider } from '@tszhong0411/ui'
import { Label } from '@tszhong0411/ui'

import { useSoundPreferences } from '@/hooks/use-sound-preferences'
import { useNotificationSound } from '@/hooks/use-notification-sound'

export default function SoundSettings() {
  const { preferences, updatePreferences, resetPreferences, isLoaded } = useSoundPreferences()
  const { playSound } = useNotificationSound({ enabled: true, volume: preferences.volume })

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Sound Settings
          </CardTitle>
          <CardDescription>Loading sound preferences...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const handleTestSound = () => {
    playSound()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {preferences.enabled ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
          Sound Settings
        </CardTitle>
        <CardDescription>
          Configure notification sound preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Enable/Disable */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Notification Sounds</Label>
            <div className="text-sm text-muted-foreground">
              Turn on/off all notification sounds
            </div>
          </div>
          <Switch
            checked={preferences.enabled}
            onCheckedChange={(checked) => updatePreferences({ enabled: checked })}
          />
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-base">Volume</Label>
            <span className="text-sm text-muted-foreground">
              {Math.round(preferences.volume * 100)}%
            </span>
          </div>
          <Slider
            value={[preferences.volume]}
            onValueChange={([value]) => updatePreferences({ volume: value })}
            max={1}
            min={0}
            step={0.1}
            disabled={!preferences.enabled}
            className="w-full"
          />
        </div>

        {/* Specific Sound Types */}
        <div className="space-y-4">
          <Label className="text-base">Sound Types</Label>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-normal">Toast Notifications</Label>
              <div className="text-xs text-muted-foreground">
                Urgent announcements (priority ≥ 3)
              </div>
            </div>
            <Switch
              checked={preferences.playOnToast}
              onCheckedChange={(checked) => updatePreferences({ playOnToast: checked })}
              disabled={!preferences.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-normal">Banner Notifications</Label>
              <div className="text-xs text-muted-foreground">
                New announcement banners
              </div>
            </div>
            <Switch
              checked={preferences.playOnBanner}
              onCheckedChange={(checked) => updatePreferences({ playOnBanner: checked })}
              disabled={!preferences.enabled}
            />
          </div>
        </div>

        {/* Test and Reset */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleTestSound}
            disabled={!preferences.enabled}
            className="flex-1"
          >
            Test Sound
          </Button>
          <Button
            variant="outline"
            onClick={resetPreferences}
            className="flex-1"
          >
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
