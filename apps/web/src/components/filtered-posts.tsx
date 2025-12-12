'use client'

import type { Post } from 'content-collections'

import { useLocale, useTranslations } from '@tszhong0411/i18n/client'
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@tszhong0411/ui'
import { SearchIcon, SlidersHorizontal, Clock, Calendar, Star, Rss, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { debounce } from '@/lib/performance'

import PostCards from './post-cards'
import Link from './link'

type FilteredPostsProps = {
  posts: Post[]
}

type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'reading-time'

const FilteredPosts = (props: FilteredPostsProps) => {
  const { posts } = props
  const locale = useLocale()
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
    const filtered = posts.filter((post) => {
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
          href={`/${locale}/rss.xml`}
          className='inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-2xl hover:bg-accent'
        >
          <Rss className='h-4 w-4' />
          {t('component.filtered-posts.rss')}
        </Link>
      </div>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <div className='mb-8 sm:mb-12 px-4 sm:px-0'>
          <div className='flex items-center gap-2 mb-6'>
            <Star className='h-5 w-5 text-yellow-500' />
            <h2 className='text-lg sm:text-xl font-semibold'>{t('component.filtered-posts.featured')}</h2>
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
            className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] px-3 py-2 rounded-2xl hover:bg-accent self-start'
          >
            <SlidersHorizontal className='h-4 w-4 flex-shrink-0' />
            <span className='text-sm'>
              {showFilters
                ? t('component.filtered-posts.toggle-filters.hide')
                : t('component.filtered-posts.toggle-filters.show')}
            </span>
          </button>

          {/* Sort Dropdown */}
          <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
            <span className='text-xs sm:text-sm text-muted-foreground whitespace-nowrap'>
              {t('component.filtered-posts.sort.label')}
            </span>
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className='w-full sm:w-40 min-h-[44px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='date-desc'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4' />
                    {t('component.filtered-posts.sort.options.date-desc')}
                  </div>
                </SelectItem>
                <SelectItem value='date-asc'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4' />
                    {t('component.filtered-posts.sort.options.date-asc')}
                  </div>
                </SelectItem>
                <SelectItem value='title-asc'>{t('component.filtered-posts.sort.options.title-asc')}</SelectItem>
                <SelectItem value='title-desc'>{t('component.filtered-posts.sort.options.title-desc')}</SelectItem>
                <SelectItem value='reading-time'>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4' />
                    {t('component.filtered-posts.sort.options.reading-time')}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-2xl bg-muted/20'>
            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <Label className='text-xs sm:text-sm font-medium mb-2 block'>
                  {t('component.filtered-posts.filters.category.label')}
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className='min-h-[44px]'>
                    <SelectValue placeholder={t('component.filtered-posts.filters.category.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>
                      {t('component.filtered-posts.filters.category.all')}
                    </SelectItem>
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
                <Label className='text-xs sm:text-sm font-medium mb-2 block'>
                  {t('component.filtered-posts.filters.tag.label')}
                </Label>
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className='min-h-[44px]'>
                    <SelectValue placeholder={t('component.filtered-posts.filters.tag.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>
                      {t('component.filtered-posts.filters.tag.all')}
                    </SelectItem>
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
              t('component.filtered-posts.searching')
            ) : searchValue || selectedCategory !== 'all' || selectedTag !== 'all' ? (
              <>
                {t('component.filtered-posts.results.count', { count: regularPosts.length })}
                {searchValue
                  ? t('component.filtered-posts.results.for', { search: searchValue })
                  : ''}
                {totalPages > 1
                  ? t('component.filtered-posts.pagination.page-of', {
                    current: currentPage,
                    total: totalPages
                  })
                  : ''}
              </>
            ) : (
              <>
                {t('component.filtered-posts.showing.count', { count: regularPosts.length })}
                {totalPages > 1
                  ? t('component.filtered-posts.pagination.page-of', {
                    current: currentPage,
                    total: totalPages
                  })
                  : ''}
              </>
            )}
          </span>
          {(searchValue || selectedCategory !== 'all' || selectedTag !== 'all') && (
            <button
              onClick={clearAllFilters}
              className='text-primary hover:text-primary/80 transition-colors min-h-[44px] px-3 py-2 rounded-2xl hover:bg-accent self-start sm:self-auto'
            >
              {t('component.filtered-posts.clear-all')}
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
            {t('component.filtered-posts.empty.description')}
          </p>
          <button
            onClick={clearAllFilters}
            className='inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 min-h-[44px]'
          >
            {t('component.filtered-posts.empty.show-all')}
          </button>
        </div>
      ) : null}

      {/* Regular Posts */}
      {regularPosts.length > 0 && (
        <div className='px-4 sm:px-0'>
          {featuredPosts.length > 0 && (
            <h2 className='text-lg sm:text-xl font-semibold mb-6'>
              {t('component.filtered-posts.posts.all')}
            </h2>
          )}
          <PostCards posts={paginatedPosts} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-center gap-2 mt-8'>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className='flex items-center gap-1 px-3 py-2 text-sm border rounded-2xl hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]'
              >
                <ChevronLeft className='h-4 w-4' />
                {t('component.filtered-posts.pagination.previous')}
              </button>

              <div className='flex items-center gap-1'>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm border rounded-2xl min-h-[44px] min-w-[44px] ${currentPage === page
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
                className='flex items-center gap-1 px-3 py-2 text-sm border rounded-2xl hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]'
              >
                {t('component.filtered-posts.pagination.next')}
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
