import { PostEditor } from '@/components/admin/post-editor'

type Props = {
  params: Promise<{
    locale: string
  }>
}

export default async function NewPostPage(props: Props) {
  const { locale } = await props.params
  
  return (
    <PostEditor 
      mode="create" 
      locale={locale}
    />
  )
}
