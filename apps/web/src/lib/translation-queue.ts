// Simple in-memory translation queue
// For production, use Redis or a proper queue system

import fs from 'fs/promises'
import path from 'path'

interface TranslationJob {
  id: string
  slug: string
  sourceLocale: string
  targetLocales: string[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  results: Array<{ locale: string; success: boolean; error?: string }>
  startedAt: Date
  completedAt?: Date
}

const JOBS_FILE = path.join(process.cwd(), '.translation-jobs.json')

class TranslationQueue {
  private jobs: Map<string, TranslationJob> = new Map()
  private initialized = false

  async init() {
    if (this.initialized) return
    
    try {
      const data = await fs.readFile(JOBS_FILE, 'utf-8')
      const jobs = JSON.parse(data)
      this.jobs = new Map(Object.entries(jobs).map(([id, job]: [string, any]) => [
        id,
        {
          ...job,
          startedAt: new Date(job.startedAt),
          completedAt: job.completedAt ? new Date(job.completedAt) : undefined
        }
      ]))
    } catch {
      // File doesn't exist or is invalid, start fresh
    }
    
    this.initialized = true
  }

  async persist() {
    try {
      const jobs = Object.fromEntries(this.jobs.entries())
      await fs.writeFile(JOBS_FILE, JSON.stringify(jobs, null, 2))
    } catch (error) {
      console.error('Failed to persist jobs:', error)
    }
  }

  async createJob(slug: string, sourceLocale: string, targetLocales: string[]): Promise<string> {
    await this.init()
    const id = `${slug}-${Date.now()}`
    const job: TranslationJob = {
      id,
      slug,
      sourceLocale,
      targetLocales,
      status: 'pending',
      progress: 0,
      results: [],
      startedAt: new Date()
    }
    this.jobs.set(id, job)
    await this.persist()
    return id
  }

  async getJob(id: string): Promise<TranslationJob | undefined> {
    await this.init()
    return this.jobs.get(id)
  }

  async updateJob(id: string, updates: Partial<TranslationJob>): Promise<void> {
    await this.init()
    const job = this.jobs.get(id)
    if (job) {
      Object.assign(job, updates)
      this.jobs.set(id, job)
      await this.persist()
    }
  }

  async addResult(id: string, result: { locale: string; success: boolean; error?: string }): Promise<void> {
    await this.init()
    const job = this.jobs.get(id)
    if (job) {
      job.results.push(result)
      job.progress = Math.round((job.results.length / job.targetLocales.length) * 100)
      this.jobs.set(id, job)
      await this.persist()
    }
  }

  async completeJob(id: string): Promise<void> {
    await this.init()
    const job = this.jobs.get(id)
    if (job) {
      job.status = 'completed'
      job.completedAt = new Date()
      job.progress = 100
      this.jobs.set(id, job)
      await this.persist()
    }
  }

  async failJob(id: string): Promise<void> {
    await this.init()
    const job = this.jobs.get(id)
    if (job) {
      job.status = 'failed'
      job.completedAt = new Date()
      this.jobs.set(id, job)
      await this.persist()
    }
  }

  // Clean up old jobs (older than 1 hour)
  cleanup(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    for (const [id, job] of this.jobs.entries()) {
      if (job.completedAt && job.completedAt < oneHourAgo) {
        this.jobs.delete(id)
      }
    }
  }
}

export const translationQueue = new TranslationQueue()

// Cleanup every 10 minutes
setInterval(() => {
  translationQueue.cleanup()
}, 10 * 60 * 1000)
