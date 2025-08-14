'use client'

import type { Post } from 'content-collections'

import { useTranslations } from '@tszhong0411/i18n/client'
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@tszhong0411/ui'
import { SearchIcon, SlidersHorizontal, Clock, Calendar, Star, Rss, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { debounce } from '@/lib/performance'

import PostCards from './post-cards'
import { PostCardSkeleton, FilterSkeleton } from './ui/loading-skeleton'
import Link from './link'

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
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 8
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
    setCurrentPage(1)
  }

  // Separate featured and regular posts
  const featuredPosts = useMemo(() => {
    return filteredAndSortedPosts.filter(post => post.featured)
  }, [filteredAndSortedPosts])

  const regularPosts = useMemo(() => {
    return filteredAndSortedPosts.filter(post => !post.featured)
  }, [filteredAndSortedPosts])

  // Pagination for regular posts
  const totalPages = Math.ceil(regularPosts.length / postsPerPage)
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage
    return regularPosts.slice(startIndex, startIndex + postsPerPage)
  }, [regularPosts, currentPage])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchValue, selectedCategory, selectedTag, sortBy])

  return (
    <>
      {/* RSS Feed Link */}
      <div className='mb-6 flex justify-end px-4 sm:px-0'>
        <Link 
          href='/blog/rss.xml' 
          className='inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-accent'
        >
          <Rss className='h-4 w-4' />
          RSS Feed
        </Link>
      </div>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <div className='mb-8 sm:mb-12 px-4 sm:px-0'>
          <div className='flex items-center gap-2 mb-6'>
            <Star className='h-5 w-5 text-yellow-500' />
            <h2 className='text-lg sm:text-xl font-semibold'>Featured Posts</h2>
          </div>
          <PostCards posts={featuredPosts} />
        </div>
      )}

      <div className='mb-6 sm:mb-8 space-y-4 px-4 sm:px-0'>
        {/* Search Bar */}
        <div className='relative'>
          <Input
            type='text'
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={t('component.filtered-posts.placeholder')}
            aria-label={t('component.filtered-posts.placeholder')}
            className='w-full pl-10 sm:pl-12 h-11 sm:h-12 text-sm border-2 focus:border-primary/50 transition-colors'
            id='search'
          />
          <Label htmlFor='search'>
            <SearchIcon className='absolute left-3 sm:left-4 top-1/2 size-4 sm:size-5 -translate-y-1/2 text-muted-foreground' />
          </Label>
        </div>

        {/* Filter Toggle */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0'>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] px-3 py-2 rounded-lg hover:bg-accent self-start'
          >
            <SlidersHorizontal className='h-4 w-4 flex-shrink-0' />
            <span className='text-sm'>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
          
          {/* Sort Dropdown */}
          <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
            <span className='text-xs sm:text-sm text-muted-foreground whitespace-nowrap'>Sort by:</span>
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className='w-full sm:w-40 min-h-[44px]'>
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
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20'>
            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <Label className='text-xs sm:text-sm font-medium mb-2 block'>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className='min-h-[44px]'>
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
                <Label className='text-xs sm:text-sm font-medium mb-2 block'>Tag</Label>
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className='min-h-[44px]'>
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
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-muted-foreground'>
          <span className='flex-1'>
            {isSearching ? (
              'Searching...'
            ) : searchValue || selectedCategory !== 'all' || selectedTag !== 'all' ? (
              <>
                {regularPosts.length} {regularPosts.length === 1 ? 'result' : 'results'}
                {searchValue && ` for "${searchValue}"`}
                {totalPages > 1 && ` (page ${currentPage} of ${totalPages})`}
              </>
            ) : (
              <>
                Showing {regularPosts.length} {regularPosts.length === 1 ? 'post' : 'posts'}
                {totalPages > 1 && ` (page ${currentPage} of ${totalPages})`}
              </>
            )}
          </span>
          {(searchValue || selectedCategory !== 'all' || selectedTag !== 'all') && (
            <button
              onClick={clearAllFilters}
              className='text-primary hover:text-primary/80 transition-colors min-h-[44px] px-3 py-2 rounded-lg hover:bg-accent self-start sm:self-auto'
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>
      
      {filteredAndSortedPosts.length === 0 ? (
        <div className='my-12 sm:my-16 lg:my-24 text-center space-y-4 px-4'>
          <div className='text-4xl sm:text-6xl'>📝</div>
          <h3 className='text-base sm:text-lg font-semibold'>
            {t('component.filtered-posts.no-posts-found')}
          </h3>
          <p className='text-muted-foreground max-w-md mx-auto text-xs sm:text-sm'>
            Try adjusting your search terms or filters, or browse all posts below.
          </p>
          <button
            onClick={clearAllFilters}
            className='inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 min-h-[44px]'
          >
            Show all posts
          </button>
        </div>
      ) : null}
      
      {/* Regular Posts */}
      {regularPosts.length > 0 && (
        <div className='px-4 sm:px-0'>
          {featuredPosts.length > 0 && (
            <h2 className='text-lg sm:text-xl font-semibold mb-6'>All Posts</h2>
          )}
          <PostCards posts={paginatedPosts} />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-center gap-2 mt-8'>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className='flex items-center gap-1 px-3 py-2 text-sm border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]'
              >
                <ChevronLeft className='h-4 w-4' />
                Previous
              </button>
              
              <div className='flex items-center gap-1'>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm border rounded-lg min-h-[44px] min-w-[44px] ${
                      currentPage === page 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'hover:bg-accent'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className='flex items-center gap-1 px-3 py-2 text-sm border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]'
              >
                Next
                <ChevronRight className='h-4 w-4' />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default FilteredPosts
