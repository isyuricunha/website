'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import createGlobe from 'cobe'
import { MapPinIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'

const LocationCard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteractingRef = useRef<{ x: number; y: number } | null>(null)
  const fadeMask = 'radial-gradient(circle at 50% 50%, rgb(0, 0, 0) 60%, rgb(0, 0, 0, 0) 70%)'
  const t = useTranslations()

  const rotationRef = useRef({ r: 0, v: 0 })
  const rotationTargetRef = useRef({ r: 0, v: 0 })

  useEffect(() => {
    let width = 0
    const canvas = canvasRef.current
    if (!canvas) return

    const onResize = () => {
      width = canvas.offsetWidth
    }
    onResize()
    const resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(canvas)

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 4.75,
      theta: 0,
      dark: 1,
      diffuse: 2,
      mapSamples: 12_000,
      mapBrightness: 2,
      baseColor: [0.61, 0.56, 0.5],
      markerColor: [0.79, 0.34, 0.16],
      glowColor: [0.79, 0.34, 0.16],
      markers: [{ location: [-23.5505, -46.6333], size: 0.1 }],
      scale: 0.75,
      onRender: (state: any) => {
        const rotation = rotationRef.current
        const target = rotationTargetRef.current

        rotation.r += (target.r - rotation.r) * 0.12
        rotation.v += (target.v - rotation.v) * 0.12

        state.phi = 4.75 + rotation.r
        state.theta = 0 + rotation.v
        state.width = width * 3
        state.height = width * 3
      }
    } as any)

    return () => {
      globe.destroy()
      resizeObserver.disconnect()
    }
  }, [])

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointerInteractingRef.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing'
  }

  const handlePointerUpOrOut = () => {
    pointerInteractingRef.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab'
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointerInteractingRef.current) return

    const deltaX = e.clientX - pointerInteractingRef.current.x
    const deltaY = e.clientY - pointerInteractingRef.current.y
    pointerInteractingRef.current = { x: e.clientX, y: e.clientY }
    rotationTargetRef.current = {
      r: rotationTargetRef.current.r + deltaX / 200,
      v: rotationTargetRef.current.v + deltaY / 200
    }
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0]
    if (!touch) return

    pointerInteractingRef.current = { x: touch.clientX, y: touch.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing'
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0]
    if (!touch || !pointerInteractingRef.current) return

    const deltaX = touch.clientX - pointerInteractingRef.current.x
    const deltaY = touch.clientY - pointerInteractingRef.current.y
    pointerInteractingRef.current = { x: touch.clientX, y: touch.clientY }
    rotationTargetRef.current = {
      r: rotationTargetRef.current.r + deltaX / 100,
      v: rotationTargetRef.current.v + deltaY / 100
    }
  }

  return (
    <div className='shadow-feature-card bg-bg-surface relative flex h-60 flex-col gap-6 overflow-hidden rounded-lg p-4 lg:p-6'>
      <div className='flex items-center gap-2'>
        <MapPinIcon className='text-accent-earth-text size-[18px]' />
        <h2 className='text-sm font-medium'>{t('homepage.about-me.location')}</h2>
      </div>
      <div className='absolute inset-x-0 bottom-[-190px] mx-auto aspect-square h-[388px] [@media(max-width:420px)]:bottom-[-140px] [@media(max-width:420px)]:h-[320px] [@media(min-width:768px)_and_(max-width:858px)]:h-[350px]'>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            placeItems: 'center',
            placeContent: 'center',
            overflow: 'visible'
          }}
        >
          <div
            style={{
              width: '100%',
              aspectRatio: '1/1',
              maxWidth: 800,
              WebkitMaskImage: fadeMask,
              maskImage: fadeMask
            }}
          >
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUpOrOut}
              onPointerOut={handlePointerUpOrOut}
              onPointerMove={handlePointerMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              style={{
                width: '100%',
                height: '100%',
                contain: 'layout paint size',
                cursor: 'grab',
                userSelect: 'none'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationCard
