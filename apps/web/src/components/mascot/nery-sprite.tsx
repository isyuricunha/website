import type { NeryMotion } from './mascot-art'

import styles from './nery-sprite.module.css'

type NerySpriteProps = {
  motion: NeryMotion
  animated: boolean
}

export const NerySprite = ({ motion, animated }: NerySpriteProps) => (
  <span
    aria-hidden='true'
    className={styles.sprite}
    data-motion={motion}
    data-animated={animated ? 'true' : 'false'}
  />
)
