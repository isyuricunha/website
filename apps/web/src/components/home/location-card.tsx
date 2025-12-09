'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import createGlobe from 'cobe'
import { MapPinIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useSpring } from 'react-spring'

const LocationCard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const fadeMask = 'radial-gradient(circle at 50% 50%, rgb(0, 0, 0) 60%, rgb(0, 0, 0, 0) 70%)'
  const t = useTranslations()

  // Criamos duas variáveis de animação: 'r' para rotação horizontal e 'v' para vertical
  const [{ r, v }, api] = useSpring(() => ({
    r: 0,
    v: 0,
    config: {
      mass: 1,
      tension: 280,
      friction: 40,
      precision: 0.001
    }
  }))

  useEffect(() => {
    let width = 0

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth
      }
    }
    onResize()
    window.addEventListener('resize', onResize)

    if (!canvasRef.current) return

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 4.75, // Valor inicial para centralizar SP horizontalmente
      theta: 0, // Valor inicial para a rotação vertical
      dark: 1,
      diffuse: 2,
      mapSamples: 12_000,
      mapBrightness: 2,
      baseColor: [0.8, 0.8, 0.8],
      // Alteramos para um azul marinho (valores normalizados)
      markerColor: [0.8, 0.7, 0],
      glowColor: [0.8, 0.7, 0],
      markers: [{ location: [-23.5505, -46.6333], size: 0.1 }],
      scale: 0.75,
      onRender: (state) => {
        // Atualiza as rotações horizontal e vertical conforme a interação do usuário
        state.phi = 4.75 + r.get()
        state.theta = 0 + v.get()
        state.width = width * 3
        state.height = width * 3
      }
    })

    return () => {
      globe.destroy()
      window.removeEventListener('resize', onResize)
    }
  }, [r, v])

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing'
  }

  const handlePointerUpOrOut = () => {
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab'
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pointerInteracting.current) {
      const deltaX = e.clientX - pointerInteracting.current.x
      const deltaY = e.clientY - pointerInteracting.current.y
      // Atualiza a posição inicial para o próximo movimento
      pointerInteracting.current = { x: e.clientX, y: e.clientY }
      api.start({
        r: r.get() + deltaX / 200,
        v: v.get() + deltaY / 200
      })
    }
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches[0]) {
      pointerInteracting.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing'
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (pointerInteracting.current && e.touches[0]) {
      const touch = e.touches[0]
      const deltaX = touch.clientX - pointerInteracting.current.x
      const deltaY = touch.clientY - pointerInteracting.current.y
      pointerInteracting.current = { x: touch.clientX, y: touch.clientY }
      api.start({
        r: r.get() + deltaX / 100,
        v: v.get() + deltaY / 100
      })
    }
  }

  return (
    <div className='shadow-feature-card relative flex h-60 flex-col gap-6 overflow-hidden rounded-xl p-4 lg:p-6'>
      <div className='flex items-center gap-2'>
        <MapPinIcon className='size-[18px]' />
        <h2 className='text-sm'>{t('homepage.about-me.location')}</h2>
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
