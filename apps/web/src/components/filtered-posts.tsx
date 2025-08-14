'use client'

import type { Post } from 'content-collections'

import { useTranslations } from '@tszhong0411/i18n/client'
import { Input, Label } from '@tszhong0411/ui'
import { SearchIcon } from 'lucide-react'
import { useEffect, useRef, useState, KeyboardEvent } from 'react'
import { parseAsString, useQueryState } from 'nuqs'

import PostCards from './post-cards'

type FilteredPostsProps = {
  posts: Post[]
}

const FilteredPosts = (props: FilteredPostsProps) => {
  const { posts } = props
  // URL-synced search query (?q=)
  const [query, setQuery] = useQueryState('q', parseAsString.withDefault(''))
  const [searchValue, setSearchValue] = useState(query)
  const t = useTranslations()
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Only sync URL when it changes externally (back/forward, link nav)
  // Typing updates local state; URL is updated on blur/Enter

  // reflect external URL changes (e.g., back/forward) into input
  useEffect(() => {
    setSearchValue(query)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const commitSearchToUrl = () => {
    const next = searchValue?.trim() || null
    setQuery(next, { startTransition: true })
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitSearchToUrl()
    }
  }

  // keyboard shortcuts: '/' to focus, 'Esc' to clear
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setSearchValue('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes((searchValue ?? '').toLowerCase())
  )

  return (
    <>
      <div className='mb-8 space-y-4'>
        <div className='relative'>
          <Input
            type='text'
            ref={inputRef}
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value)
            }}
            onBlur={commitSearchToUrl}
            onKeyDown={onKeyDown}
            placeholder={t('component.filtered-posts.placeholder')}
            aria-label={t('component.filtered-posts.placeholder')}
            className='w-full pl-12 h-12 text-base border-2 focus:border-primary/50 transition-colors'
            id='search'
          />
          <Label htmlFor='search'>
            <SearchIcon className='absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground' />
          </Label>
        </div>
        
        {/* Search results count */}
        <div className='flex items-center justify-between text-sm text-muted-foreground' aria-live='polite'>
          <span>
            {searchValue ? (
              <>
                {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'} for "{searchValue}"
              </>
            ) : (
              <>Showing {posts.length} {posts.length === 1 ? 'post' : 'posts'}</>
            )}
          </span>
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className='text-primary hover:text-primary/80 transition-colors'
            >
              Clear search
            </button>
          )}
        </div>
      </div>
      
      {filteredPosts.length === 0 ? (
        <div className='my-24 text-center space-y-4'>
          <div className='text-6xl'>📝</div>
          <h3 className='text-xl font-semibold'>
            {t('component.filtered-posts.no-posts-found')}
          </h3>
          <p className='text-muted-foreground max-w-md mx-auto'>
            Try adjusting your search terms or browse all posts below.
          </p>
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className='inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90'
            >
              Show all posts
            </button>
          )}
        </div>
      ) : null}
      
      <PostCards posts={filteredPosts} />
    </>
  )
}

export default FilteredPosts
