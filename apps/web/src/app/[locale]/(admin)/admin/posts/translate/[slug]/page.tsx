import { notFound } from 'next/navigation'
import { TranslationEditor } from '@/components/admin/translation-editor'
import { BlogService } from '@/lib/blog/blog-service'

type Props = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export default async function TranslatePostPage(props: Props) {
  const { locale, slug } = await props.params
  
  // Get all versions of this post
  const postsBySlug = await BlogService.getPostsBySlug()
  const posts = postsBySlug[slug]
  
  if (!posts || posts.length === 0) {
    notFound()
  }
  
  return (
    <TranslationEditor 
      slug={slug}
      posts={posts}
      currentLocale={locale}
    />
  )
}
