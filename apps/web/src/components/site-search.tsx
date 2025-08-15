'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import { Card, CardContent, Input } from '@tszhong0411/ui'
import { Search, FileText, User, Music, Code, Calendar } from 'lucide-react'
import { useState, useMemo, useCallback } from 'react'
import { useRouter } from '@tszhong0411/i18n/routing'

import { allPosts } from 'content-collections'
import { allProjects } from 'content-collections'
import Link from './link'

type SearchResult = {
  id: string
  title: string
  description: string
  href: string
  type: 'post' | 'project' | 'page'
  icon: React.ReactNode
  date?: string
}

const SiteSearch = () => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations()
  const router = useRouter()

  // Combine all searchable content
  const searchableContent = useMemo(() => {
    const results: SearchResult[] = []

    // Add blog posts
    allPosts.forEach(post => {
      results.push({
        id: post.slug,
        title: post.title,
        description: post.summary,
        href: `/blog/${post.slug}`,
        type: 'post',
        icon: <FileText className='h-4 w-4' />,
        date: post.date
      })
    })

    // Add projects
    allProjects.forEach(project => {
      results.push({
        id: project.slug,
        title: project.name,
        description: project.description,
        href: `/projects#${project.slug}`,
        type: 'project',
        icon: <Code className='h-4 w-4' />
      })
    })

    // Add static pages
    const staticPages = [
      {
        id: 'about',
        title: 'About',
        description: 'Learn more about me and my background',
        href: '/about',
        type: 'page' as const,
        icon: <User className='h-4 w-4' />
      },
      {
        id: 'uses',
        title: t('layout.uses'),
        description: 'Tools and equipment I use for development',
        href: '/uses',
        type: 'page' as const,
        icon: <Code className='h-4 w-4' />
      },
      {
        id: 'spotify',
        title: t('layout.spotify'),
        description: 'My music taste and listening activity',
        href: '/spotify',
        type: 'page' as const,
        icon: <Music className='h-4 w-4' />
      }
    ]

    results.push(...staticPages)
    return results
  }, [t])

  // Filter results based on query
  const filteredResults = useMemo(() => {
    if (!query.trim()) return []

    const searchTerm = query.toLowerCase()
    return searchableContent
      .filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
      )
      .slice(0, 8) // Limit results
  }, [query, searchableContent])

  const handleResultClick = useCallback((href: string) => {
    setIsOpen(false)
    setQuery('')
    router.push(href)
  }, [router])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setQuery('')
    }
  }, [])

  return (
    <div className='relative'>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          type='text'
          placeholder='Search site...'
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(e.target.value.length > 0)
          }}
          onFocus={() => setIsOpen(query.length > 0)}
          onKeyDown={handleKeyDown}
          className='pl-10 text-sm'
        />
      </div>

      {isOpen && filteredResults.length > 0 && (
        <>
          <div 
            className='fixed inset-0 z-40' 
            onClick={() => setIsOpen(false)}
          />
          <Card className='absolute top-full mt-2 w-full z-50 max-h-96 overflow-y-auto'>
            <CardContent className='p-2'>
              <div className='space-y-1'>
                {filteredResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result.href)}
                    className='w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors group'
                  >
                    <div className='flex items-start gap-3'>
                      <div className='flex-shrink-0 mt-0.5 text-muted-foreground group-hover:text-foreground'>
                        {result.icon}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1'>
                          <h4 className='text-sm font-medium truncate group-hover:text-primary'>
                            {result.title}
                          </h4>
                          <span className='text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full'>
                            {result.type}
                          </span>
                        </div>
                        <p className='text-xs text-muted-foreground line-clamp-2'>
                          {result.description}
                        </p>
                        {result.date && (
                          <div className='flex items-center gap-1 mt-1'>
                            <Calendar className='h-3 w-3 text-muted-foreground' />
                            <span className='text-xs text-muted-foreground'>
                              {new Date(result.date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {isOpen && query.length > 0 && filteredResults.length === 0 && (
        <>
          <div 
            className='fixed inset-0 z-40' 
            onClick={() => setIsOpen(false)}
          />
          <Card className='absolute top-full mt-2 w-full z-50'>
            <CardContent className='p-4 text-center'>
              <Search className='h-8 w-8 mx-auto text-muted-foreground mb-2' />
              <p className='text-sm text-muted-foreground'>
                No results found for "{query}"
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default SiteSearch
