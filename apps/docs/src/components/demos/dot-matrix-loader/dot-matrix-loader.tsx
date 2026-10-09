import { DotMatrixLoader } from '@isyuricunha/yutheme'

const DotMatrixLoaderDemo = () => {
  return (
    <div className='flex items-center gap-6'>
      <DotMatrixLoader label='Loading' />
      <DotMatrixLoader agent label='Thinking' />
    </div>
  )
}

export default DotMatrixLoaderDemo
