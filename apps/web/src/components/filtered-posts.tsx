'use client'

import type { Post } from 'content-collections'

import { useLocale, useTranslations } from '@isyuricunha/i18n/client'
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@isyuricunha/ui'
import {
  SearchIcon,
  SlidersHorizontal,
  Clock,
  Calendar,
  Star,
  Rss,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
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
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 8
  const t = useTranslations()

  // Debounced search to improve performance
  const debouncedSearch = useMemo(() => {
    return debounce((value: string) => {
      setDebouncedSearchValue(value)
    }, 300)
  }, [])

  useEffect(() => {
    if (searchValue !== debouncedSearchValue) {
      debouncedSearch(searchValue)
    }
  }, [searchValue, debouncedSearchValue, debouncedSearch])

  const isSearching = searchValue !== debouncedSearchValue

  // Extract unique categories and tags
  const { categories, tags } = useMemo(() => {
    const categorySet = new Set<string>()
    const tagSet = new Set<string>()

    posts.forEach((post) => {
      if (post.category) categorySet.add(post.category)
      if (post.tags) post.tags.forEach((tag) => tagSet.add(tag))
    })

    return {
      categories: Array.from(categorySet).toSorted(),
      tags: Array.from(tagSet).toSorted()
    }
  }, [posts])

  const filteredAndSortedPosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      const matchesSearch =
        debouncedSearchValue === '' ||
        post.title.toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
        post.summary.toLowerCase().includes(debouncedSearchValue.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
      const matchesTag = selectedTag === 'all' || (post.tags && post.tags.includes(selectedTag))

      return matchesSearch && matchesCategory && matchesTag
    })

    return filtered.toSorted((a, b) => {
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
    return filteredAndSortedPosts.filter((post) => post.featured)
  }, [filteredAndSortedPosts])

  const regularPosts = useMemo(() => {
    return filteredAndSortedPosts.filter((post) => !post.featured)
  }, [filteredAndSortedPosts])

  // Pagination for regular posts
  const totalPages = Math.ceil(regularPosts.length / postsPerPage)
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage
    return regularPosts.slice(startIndex, startIndex + postsPerPage)
  }, [regularPosts, currentPage])

  return (
    <>
      {/* RSS Feed Link */}
      <div className='mb-6 flex justify-end px-4 sm:px-0'>
        <Link
          href={`/${locale}/rss.xml`}
          className='text-muted-foreground hover:bg-bg-hover hover:text-foreground inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors sm:text-sm'
        >
          <Rss className='h-4 w-4' />
          {t('component.filtered-posts.rss')}
        </Link>
      </div>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <div className='mb-8 px-4 sm:mb-12 sm:px-0'>
          <div className='mb-6 flex items-center gap-2'>
            <Star className='text-accent-earth-text h-5 w-5' />
            <h2 className='text-lg font-medium sm:text-xl'>
              {t('component.filtered-posts.featured')}
            </h2>
          </div>
          <PostCards posts={featuredPosts} />
        </div>
      )}

      <div className='mb-6 space-y-4 px-4 sm:mb-8 sm:px-0'>
        {/* Search Bar */}
        <div className='relative'>
          <Input
            type='text'
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value)
              setCurrentPage(1)
            }}
            placeholder={t('component.filtered-posts.placeholder')}
            aria-label={t('component.filtered-posts.placeholder')}
            className='h-11 w-full border border-[var(--border-default)] pl-10 text-sm transition-colors focus:border-[var(--accent-border)] sm:h-12 sm:pl-12'
            id='search'
          />
          <Label htmlFor='search'>
            <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2 sm:left-4 sm:size-5' />
          </Label>
        </div>

        {/* Filter Toggle */}
        <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-0'>
          <button
            type='button'
            onClick={() => setShowFilters(!showFilters)}
            className='text-muted-foreground hover:bg-bg-hover hover:text-foreground flex min-h-[44px] items-center gap-2 self-start rounded-md px-3 py-2 text-sm transition-colors'
          >
            <SlidersHorizontal className='h-4 w-4 flex-shrink-0' />
            <span className='text-sm'>
              {showFilters
                ? t('component.filtered-posts.toggle-filters.hide')
                : t('component.filtered-posts.toggle-filters.show')}
            </span>
          </button>

          {/* Sort Dropdown */}
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
            <span className='text-muted-foreground text-xs whitespace-nowrap sm:text-sm'>
              {t('component.filtered-posts.sort.label')}
            </span>
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => {
                setSortBy(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className='min-h-[44px] w-full sm:w-40'>
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
                <SelectItem value='title-asc'>
                  {t('component.filtered-posts.sort.options.title-asc')}
                </SelectItem>
                <SelectItem value='title-desc'>
                  {t('component.filtered-posts.sort.options.title-desc')}
                </SelectItem>
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
          <div className='bg-bg-surface grid grid-cols-1 gap-4 rounded-lg border border-[var(--border-subtle)] p-4 sm:grid-cols-2'>
            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <Label className='mb-2 block text-xs font-medium sm:text-sm'>
                  {t('component.filtered-posts.filters.category.label')}
                </Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className='min-h-[44px]'>
                    <SelectValue placeholder={t('component.filtered-posts.filters.category.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>
                      {t('component.filtered-posts.filters.category.all')}
                    </SelectItem>
                    {categories.map((category) => (
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
                <Label className='mb-2 block text-xs font-medium sm:text-sm'>
                  {t('component.filtered-posts.filters.tag.label')}
                </Label>
                <Select
                  value={selectedTag}
                  onValueChange={(value) => {
                    setSelectedTag(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className='min-h-[44px]'>
                    <SelectValue placeholder={t('component.filtered-posts.filters.tag.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>
                      {t('component.filtered-posts.filters.tag.all')}
                    </SelectItem>
                    {tags.map((tag) => (
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
        <div className='text-muted-foreground flex flex-col justify-between gap-2 text-xs sm:flex-row sm:items-center sm:text-sm'>
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
              type='button'
              onClick={clearAllFilters}
              className='text-accent-earth-text hover:bg-bg-hover hover:text-accent-earth-hover min-h-[44px] self-start rounded-md px-3 py-2 transition-colors sm:self-auto'
            >
              {t('component.filtered-posts.clear-all')}
            </button>
          )}
        </div>
      </div>

      {filteredAndSortedPosts.length === 0 ? (
        <div className='my-12 space-y-4 px-4 text-center sm:my-16 lg:my-24'>
          <div className='text-4xl sm:text-6xl'>📝</div>
          <h3 className='text-base font-medium sm:text-lg'>
            {t('component.filtered-posts.no-posts-found')}
          </h3>
          <p className='text-muted-foreground mx-auto max-w-md text-xs sm:text-sm'>
            {t('component.filtered-posts.empty.description')}
          </p>
          <button
            type='button'
            onClick={clearAllFilters}
            className='border-accent-earth-hover bg-accent-earth hover:bg-accent-earth-hover inline-flex min-h-[44px] items-center justify-center rounded-md border px-6 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors'
          >
            {t('component.filtered-posts.empty.show-all')}
          </button>
        </div>
      ) : null}

      {/* Regular Posts */}
      {regularPosts.length > 0 && (
        <div className='px-4 sm:px-0'>
          {featuredPosts.length > 0 && (
            <h2 className='mb-6 text-lg font-medium sm:text-xl'>
              {t('component.filtered-posts.posts.all')}
            </h2>
          )}
          <PostCards posts={paginatedPosts} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='mt-8 flex items-center justify-center gap-2'>
              <button
                type='button'
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className='hover:bg-bg-hover flex min-h-[44px] items-center gap-1 rounded-md border border-[var(--border-subtle)] px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50'
              >
                <ChevronLeft className='h-4 w-4' />
                {t('component.filtered-posts.pagination.previous')}
              </button>

              <div className='flex items-center gap-1'>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    type='button'
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-h-[44px] min-w-[44px] rounded-md border px-3 py-2 text-sm ${
                      currentPage === page
                        ? 'border-accent-earth bg-accent-earth text-[var(--text-primary)]'
                        : 'hover:bg-bg-hover border-[var(--border-subtle)]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type='button'
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className='hover:bg-bg-hover flex min-h-[44px] items-center gap-1 rounded-md border border-[var(--border-subtle)] px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50'
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
