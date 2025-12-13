import { Avatar, AvatarFallback, AvatarImage } from '@isyuricunha/ui'

const AvatarDemo = () => {
  return (
    <Avatar>
      <AvatarImage src='https://github.com/isyuricunha.png' alt='@isyuricunha' />
      <AvatarFallback>YC</AvatarFallback>
    </Avatar>
  )
}

export default AvatarDemo
