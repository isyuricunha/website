'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import { Card, CardContent, Input } from '@tszhong0411/ui'
import { Search, FileText, User, Music, Code, Calendar } from 'lucide-react'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from '@tszhong0411/i18n/routing'

import { allPosts , allProjects } from 'content-collections'

import { HighlightText } from './ui/highlight-text'

type SearchResult = {
  id: string
  title: string
  description: string
  href: string
  type: 'post' | 'project' | 'page'
  icon: React.ReactNode
  date?: string
}

const RECENT_SEARCHES_KEY = 'site_search_recent'
const MAX_RECENT_SEARCHES = 5

const SiteSearch = () => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
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
        title: t('layout.about'),
        description: t('about.description'),
        href: '/about',
        type: 'page' as const,
        icon: <User className='h-4 w-4' />
      },
      {
        id: 'uses',
        title: t('layout.uses'),
        description: t('uses.description'),
        href: '/uses',
        type: 'page' as const,
        icon: <Code className='h-4 w-4' />
      },
      {
        id: 'spotify',
        title: t('layout.spotify'),
        description: t('spotify.description'),
        href: '/spotify',
        type: 'page' as const,
        icon: <Music className='h-4 w-4' />
      }
    ]

    results.push(...staticPages)

    // Deduplicate by href to avoid duplicate keys/entries across locales or sources
    const uniqueByHref = Array.from(new Map(results.map(r => [r.href, r])).values())
    return uniqueByHref
  }, [t])

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (saved) {
        setRecentSearches(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading recent searches:', error)
    }
  }, [])

  // Save search to recent searches
  const saveRecentSearch = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return

    try {
      const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)]
        .slice(0, MAX_RECENT_SEARCHES)
      setRecentSearches(updated)
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error('Error saving recent search:', error)
    }
  }, [recentSearches])

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

  // Show recent searches when no query
  const showRecentSearches = !query.trim() && recentSearches.length > 0
  const allResults = showRecentSearches ? [] : filteredResults
  const totalItems = showRecentSearches ? recentSearches.length : allResults.length

  const handleResultClick = useCallback((href: string, searchTerm?: string) => {
    if (searchTerm) {
      saveRecentSearch(searchTerm)
    }
    setIsOpen(false)
    setQuery('')
    setSelectedIndex(-1)
    router.push(href)
  }, [router, saveRecentSearch])

  const handleRecentSearchClick = useCallback((searchTerm: string) => {
    setQuery(searchTerm)
    setSelectedIndex(-1)
    // Don't close dropdown, let user see results
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setQuery('')
      setSelectedIndex(-1)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev =>
        prev < totalItems - 1 ? prev + 1 : prev
      )
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > -1 ? prev - 1 : -1)
    }

    if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      if (showRecentSearches) {
        const term = recentSearches[selectedIndex]
        if (term) {
          handleRecentSearchClick(term)
        }
      } else {
        const result = allResults[selectedIndex]
        if (result) {
          handleResultClick(result.href, query)
        }
      }
    }
  }, [totalItems, selectedIndex, showRecentSearches, recentSearches, allResults, handleRecentSearchClick, handleResultClick, query])

  return (
    <div className='relative'>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          type='text'
          placeholder={t('site-search.placeholder', { default: 'Search the site...' })}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedIndex(-1)
            setIsOpen(e.target.value.length > 0 || recentSearches.length > 0)
          }}
          onFocus={() => setIsOpen(query.length > 0 || recentSearches.length > 0)}
          onKeyDown={handleKeyDown}
          className='pl-10 text-sm'
        />
      </div>

      {isOpen && (showRecentSearches || filteredResults.length > 0) && (
        <>
          <div
            className='fixed inset-0 z-40'
            onClick={() => {
              setIsOpen(false)
              setSelectedIndex(-1)
            }}
          />
          <Card className='absolute top-full mt-2 w-full z-50 max-h-96 overflow-y-auto'>
            <CardContent className='p-2'>
              <div className='space-y-1'>
                {/* Recent Searches */}
                {showRecentSearches && (
                  <>
                    <div className='px-3 py-2 text-xs font-medium text-muted-foreground border-b'>
                      {t('site-search.recent-searches', { default: 'Recent searches' })}
                    </div>
                    {recentSearches.map((searchTerm, index) => (
                      <button
                        key={`recent-${searchTerm}-${index}`}
                        onClick={() => handleRecentSearchClick(searchTerm)}
                        className={`w-full text-left p-3 rounded-lg transition-colors group ${selectedIndex === index ? 'bg-accent' : 'hover:bg-muted/50'
                          }`}
                      >
                        <div className='flex items-center gap-3'>
                          <Search className='h-4 w-4 text-muted-foreground' />
                          <span className='text-sm'>{searchTerm}</span>
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {/* Search Results */}
                {filteredResults.map((result, index) => (
                  <button
                    key={`result-${result.href}`}
                    onClick={() => handleResultClick(result.href, query)}
                    className={`w-full text-left p-3 rounded-lg transition-colors group ${selectedIndex === index ? 'bg-accent' : 'hover:bg-muted/50'
                      }`}
                  >
                    <div className='flex items-start gap-3'>
                      <div className='flex-shrink-0 mt-0.5 text-muted-foreground group-hover:text-foreground'>
                        {result.icon}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1'>
                          <h4 className='text-sm font-medium truncate group-hover:text-primary'>
                            <HighlightText text={result.title} searchTerm={query} />
                          </h4>
                          <span className='text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full'>
                            {t(`homepage.recently-updated.type.${result.type}`)}
                          </span>
                        </div>
                        <p className='text-xs text-muted-foreground line-clamp-2'>
                          <HighlightText text={result.description} searchTerm={query} />
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

      {isOpen && query.length > 0 && filteredResults.length === 0 && !showRecentSearches && (
        <>
          <div
            className='fixed inset-0 z-40'
            onClick={() => {
              setIsOpen(false)
              setSelectedIndex(-1)
            }}
          />
          <Card className='absolute top-full mt-2 w-full z-50'>
            <CardContent className='p-4 text-center'>
              <Search className='h-8 w-8 mx-auto text-muted-foreground mb-2' />
              <p className='text-sm text-muted-foreground'>
                {t('site-search.no-results', { default: 'No results for' })} "{query}"
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default SiteSearch
