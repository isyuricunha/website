import { notFound } from 'next/navigation'
import { PostEditor } from '@/components/admin/post-editor'
import { BlogService } from '@/lib/blog/blog-service'

type Props = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export default async function EditPostPage(props: Props) {
  const { locale, slug } = await props.params
  
  // Get the post data
  const post = await BlogService.getPost(slug, locale)
  
  if (!post) {
    notFound()
  }
  
  return (
    <PostEditor 
      mode="edit" 
      locale={locale}
      initialData={{
        slug: post.slug,
        title: post.title,
        summary: post.summary,
        content: post.content,
        tags: post.tags || []
      }}
    />
  )
}
