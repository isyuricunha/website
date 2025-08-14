'use client'

import type { Post } from 'content-collections'

import { useTranslations } from '@tszhong0411/i18n/client'
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@tszhong0411/ui'
import { SearchIcon, SlidersHorizontal, Clock, Calendar } from 'lucide-react'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { debounce } from '@/lib/performance'

import PostCards from './post-cards'
import { PostCardSkeleton, FilterSkeleton } from './ui/loading-skeleton'

type FilteredPostsProps = {
  posts: Post[]
}

type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'reading-time'

const FilteredPosts = (props: FilteredPostsProps) => {
  const { posts } = props
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')
  const [showFilters, setShowFilters] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const t = useTranslations()

  // Debounced search to improve performance
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchValue(value)
      setIsSearching(false)
    }, 300),
    []
  )

  useEffect(() => {
    if (searchValue !== debouncedSearchValue) {
      setIsSearching(true)
      debouncedSearch(searchValue)
    }
  }, [searchValue, debouncedSearchValue, debouncedSearch])

  // Extract unique categories and tags
  const { categories, tags } = useMemo(() => {
    const categorySet = new Set<string>()
    const tagSet = new Set<string>()
    
    posts.forEach(post => {
      if (post.category) categorySet.add(post.category)
      if (post.tags) post.tags.forEach(tag => tagSet.add(tag))
    })
    
    return {
      categories: Array.from(categorySet).sort(),
      tags: Array.from(tagSet).sort()
    }
  }, [posts])

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts.filter((post) => {
      const matchesSearch = debouncedSearchValue === '' || 
        post.title.toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
        post.summary.toLowerCase().includes(debouncedSearchValue.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
      const matchesTag = selectedTag === 'all' || (post.tags && post.tags.includes(selectedTag))
      
      return matchesSearch && matchesCategory && matchesTag
    })

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'title-asc':
          return a.title.localeCompare(b.title)
        case 'title-desc':
          return b.title.localeCompare(a.title)
        case 'reading-time':
          return (a.readingTime || 0) - (b.readingTime || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [posts, debouncedSearchValue, selectedCategory, selectedTag, sortBy])

  const clearAllFilters = () => {
    setSearchValue('')
    setSelectedCategory('all')
    setSelectedTag('all')
    setSortBy('date-desc')
  }

  return (
    <>
      <div className='mb-8 space-y-4'>
        {/* Search Bar */}
        <div className='relative'>
          <Input
            type='text'
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={t('component.filtered-posts.placeholder')}
            aria-label={t('component.filtered-posts.placeholder')}
            className='w-full pl-12 h-12 text-base border-2 focus:border-primary/50 transition-colors'
            id='search'
          />
          <Label htmlFor='search'>
            <SearchIcon className='absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground' />
          </Label>
        </div>

        {/* Filter Toggle */}
        <div className='flex items-center justify-between'>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
          >
            <SlidersHorizontal className='h-4 w-4' />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          {/* Sort Dropdown */}
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>Sort by:</span>
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className='w-40'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='date-desc'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4' />
                    Newest First
                  </div>
                </SelectItem>
                <SelectItem value='date-asc'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4' />
                    Oldest First
                  </div>
                </SelectItem>
                <SelectItem value='title-asc'>A-Z</SelectItem>
                <SelectItem value='title-desc'>Z-A</SelectItem>
                <SelectItem value='reading-time'>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4' />
                    Reading Time
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20'>
            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <Label className='text-sm font-medium mb-2 block'>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder='All Categories' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Tag Filter */}
            {tags.length > 0 && (
              <div>
                <Label className='text-sm font-medium mb-2 block'>Tag</Label>
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger>
                    <SelectValue placeholder='All Tags' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Tags</SelectItem>
                    {tags.map(tag => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
        
        {/* Results Summary */}
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <span>
            {isSearching ? (
              'Searching...'
            ) : searchValue || selectedCategory !== 'all' || selectedTag !== 'all' ? (
              <>
                {filteredAndSortedPosts.length} {filteredAndSortedPosts.length === 1 ? 'result' : 'results'}
                {searchValue && ` for "${searchValue}"`}
              </>
            ) : (
              <>Showing {posts.length} {posts.length === 1 ? 'post' : 'posts'}</>
            )}
          </span>
          {(searchValue || selectedCategory !== 'all' || selectedTag !== 'all') && (
            <button
              onClick={clearAllFilters}
              className='text-primary hover:text-primary/80 transition-colors'
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>
      
      {filteredAndSortedPosts.length === 0 ? (
        <div className='my-24 text-center space-y-4'>
          <div className='text-6xl'>📝</div>
          <h3 className='text-xl font-semibold'>
            {t('component.filtered-posts.no-posts-found')}
          </h3>
          <p className='text-muted-foreground max-w-md mx-auto'>
            Try adjusting your search terms or filters, or browse all posts below.
          </p>
          <button
            onClick={clearAllFilters}
            className='inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90'
          >
            Show all posts
          </button>
        </div>
      ) : null}
      
      <PostCards posts={filteredAndSortedPosts} />
    </>
  )
}

export default FilteredPosts
