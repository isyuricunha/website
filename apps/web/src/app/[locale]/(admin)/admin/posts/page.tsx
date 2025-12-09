import Link from 'next/link'
import { PlusIcon, EditIcon, LanguagesIcon, EyeIcon } from 'lucide-react'

import { Button } from '@tszhong0411/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@tszhong0411/ui'
import { Badge } from '@tszhong0411/ui'
import { BlogService } from '@/lib/blog/blog-service'

type Props = {
  params: Promise<{
    locale: string
  }>
}

export default async function PostsPage(props: Props) {
  const { locale } = await props.params
  const postsBySlug = await BlogService.getPostsBySlug()
  
  const slugs = Object.keys(postsBySlug).sort((a, b) => {
    const aPost = postsBySlug[a][0]
    const bPost = postsBySlug[b][0]
    return new Date(bPost.date).getTime() - new Date(aPost.date).getTime()
  })

  const getLanguageCount = (posts: any[]) => posts.length
  const getMainPost = (posts: any[]) => posts.find(p => p.locale === 'en') || posts[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground">
            Manage all your blog posts and translations
          </p>
        </div>
        <Button asChild>
          <Link href={`/admin/posts/new`}>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {slugs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-medium">No posts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first blog post to get started
                </p>
                <Button asChild>
                  <Link href={`/admin/posts/new`}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create First Post
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          slugs.map((slug) => {
            const posts = postsBySlug[slug]
            const mainPost = getMainPost(posts)
            const languageCount = getLanguageCount(posts)
            
            return (
              <Card key={slug} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-xl">{mainPost.title}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {mainPost.summary}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{new Date(mainPost.date).toLocaleDateString()}</span>
                        <Badge variant="secondary">
                          <LanguagesIcon className="mr-1 h-3 w-3" />
                          {languageCount}/6 languages
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/${locale}/blog/${slug}`}>
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/posts/edit/${slug}`}>
                          <EditIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/posts/translate/${slug}`}>
                          <LanguagesIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Language Status */}
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {['en', 'pt', 'fr', 'de', 'ja', 'zh'].map((lang) => {
                      const hasTranslation = posts.some(p => p.locale === lang)
                      return (
                        <Badge 
                          key={lang} 
                          variant={hasTranslation ? "default" : "outline"}
                          className="text-xs"
                        >
                          {lang.toUpperCase()}
                        </Badge>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
