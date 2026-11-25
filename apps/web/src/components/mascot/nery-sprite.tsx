import type { NeryMotion } from './mascot-art'

import { useState } from 'react'

import styles from './nery-sprite.module.css'

type NerySpriteProps = {
  motion: NeryMotion
  animated: boolean
}

const MotionSprite = ({ motion, animated }: NerySpriteProps) => {
  const [finished, setFinished] = useState(false)
  const returnsToIdle = motion === 'waving' || motion === 'review'
  return (
    <span
      aria-hidden='true'
      className={styles.sprite}
      data-motion={finished && returnsToIdle ? 'idle' : motion}
      data-animated={animated ? 'true' : 'false'}
      onAnimationEnd={() => {
        if (returnsToIdle) setFinished(true)
      }}
    />
  )
}

export const NerySprite = (props: NerySpriteProps) => <MotionSprite key={props.motion} {...props} />
