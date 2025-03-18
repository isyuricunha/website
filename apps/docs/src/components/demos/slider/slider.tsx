import { Slider, SliderControl, SliderRange, SliderThumb, SliderTrack } from '@tszhong0411/ui'

const SliderDemo = () => {
  return (
    <Slider defaultValue={[10]} className='w-3/5'>
      <SliderControl>
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb index={0} />
      </SliderControl>
    </Slider>
  )
}

export default SliderDemo
