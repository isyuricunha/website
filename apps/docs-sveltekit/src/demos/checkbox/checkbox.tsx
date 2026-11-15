import { Checkbox, Label } from '@isyuricunha/yutheme'

const CheckboxDemo = () => {
  return (
    <div className='flex items-center gap-2'>
      <Checkbox id='terms' />
      <Label htmlFor='terms'>Accept terms and conditions</Label>
    </div>
  )
}

export default CheckboxDemo
