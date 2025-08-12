'use client'

import { useState } from 'react'

const ImageTest = () => {
  const [testUrl, setTestUrl] = useState('')
  const [imageError, setImageError] = useState<string | null>(null)
  const [imageSuccess, setImageSuccess] = useState(false)

  const testImage = (url: string) => {
    setTestUrl(url)
    setImageError(null)
    setImageSuccess(false)

    const img = new Image()
    img.onload = () => {
      setImageSuccess(true)
      console.log('Image loaded successfully:', url)
    }
    img.onerror = (e) => {
      setImageError(`Failed to load image: ${url}`)
      console.error('Image failed to load:', url, e)
    }
    img.src = url
  }

  return (
    <div className="p-4 border rounded-lg bg-muted/50">
      <h3 className="text-lg font-semibold mb-4">Image Test</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Test URL:</label>
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="Enter Spotify image URL to test"
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          onClick={() => testImage(testUrl)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Test Image
        </button>
        {imageSuccess && (
          <div className="text-green-600">✓ Image loaded successfully!</div>
        )}
        {imageError && (
          <div className="text-red-600">✗ {imageError}</div>
        )}
        {testUrl && (
          <div className="mt-4">
            <img
              src={testUrl}
              alt="Test"
              className="w-32 h-32 object-cover rounded"
              onError={(e) => {
                console.error('Next/Image error:', e)
                setImageError('Next/Image also failed')
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageTest
