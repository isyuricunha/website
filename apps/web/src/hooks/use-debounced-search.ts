'use client'

import { useCallback, useEffect, useState } from 'react'

interface UseDebounceSearchProps {
  initialValue?: string
  delay?: number
}

export const useDebounceSearch = ({ initialValue = '', delay = 300 }: UseDebounceSearchProps = {}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm, delay])

  const updateSearchTerm = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
  }, [])

  return {
    searchTerm,
    debouncedSearchTerm,
    updateSearchTerm,
    clearSearch
  }
}
