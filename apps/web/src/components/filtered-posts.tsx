'use client'

import type { Post } from 'content-collections'

import { useTranslations } from '@tszhong0411/i18n/client'
import { Input, Label } from '@tszhong0411/ui'
import { SearchIcon } from 'lucide-react'
import { useState } from 'react'

import PostCards from './post-cards'

type FilteredPostsProps = {
  posts: Post[]
}

const FilteredPosts = (props: FilteredPostsProps) => {
  const { posts } = props
  const [searchValue, setSearchValue] = useState('')
  const t = useTranslations()

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchValue.toLowerCase())
  )

  return (
    <>
      <div className='mb-8 space-y-4'>
        <div className='relative'>
          <Input
            type='text'
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value)
            }}
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
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
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
