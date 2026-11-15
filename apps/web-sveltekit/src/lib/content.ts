import { allPosts, allProjects, allSnippets } from 'content-collections'

import type { Post, Project, Snippet } from 'content-collections'

export type { Post, Project, Snippet }

function sortByDateDesc<T extends { date: string }>(docs: T[]): T[] {
  return docs.toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPosts(locale: string): Post[] {
  return sortByDateDesc(allPosts.filter((post) => post.locale === locale))
}

export function getPost(locale: string, slug: string): Post | undefined {
  return allPosts.find((post) => post.locale === locale && post.slug === slug)
}

export function getSnippets(locale: string): Snippet[] {
  return sortByDateDesc(allSnippets.filter((snippet) => snippet.locale === locale))
}

export function getSnippet(locale: string, slug: string): Snippet | undefined {
  return allSnippets.find((snippet) => snippet.locale === locale && snippet.slug === slug)
}

export function getProjects(locale: string): Project[] {
  return allProjects
    .filter((project) => project.locale === locale)
    .toSorted((a, b) => a.name.localeCompare(b.name))
}

export function getProject(locale: string, slug: string): Project | undefined {
  return allProjects.find((project) => project.locale === locale && project.slug === slug)
}

export function getPostSlugs(): Array<{ locale: string; slug: string }> {
  return allPosts.map((post) => ({ locale: post.locale, slug: post.slug }))
}
