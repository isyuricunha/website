import {
  Slider,
  SliderControl,
  SliderLabel,
  SliderRange,
  SliderThumb,
  SliderTrack
} from '@isyuricunha/ui'

const SliderWithLabelDemo = () => {
  return (
    <Slider defaultValue={[10]} className='w-3/5'>
      <SliderLabel>Label</SliderLabel>
      <SliderControl>
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb index={0} />
      </SliderControl>
    </Slider>
  )
}

export default SliderWithLabelDemo
