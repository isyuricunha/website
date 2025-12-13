import { env } from '@isyuricunha/env'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isDevelopment = env.NODE_ENV === 'development'
  private isProduction = env.NODE_ENV === 'production'

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(this.sanitizeContext(context))}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  private sanitizeContext(context: LogContext): LogContext {
    const sanitized: LogContext = {}

    for (const [key, value] of Object.entries(context)) {
      // Skip sensitive fields
      const lowerKey = key.toLowerCase()
      if (
        lowerKey.includes('password') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('token') ||
        lowerKey.includes('apikey') ||
        lowerKey.includes('api_key') ||
        lowerKey.includes('email') ||
        lowerKey.includes('hash')
      ) {
        sanitized[key] = '[REDACTED]'
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeContext(value as LogContext)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage('info', message, context))
    }
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context))
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error:
        error instanceof Error
          ? {
            message: error.message,
            stack: this.isDevelopment ? error.stack : undefined
          }
          : error
    }
    console.error(this.formatMessage('error', message, errorContext))
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context))
    }
  }

  // Specific logging methods for common use cases
  apiCall(method: string, endpoint: string, duration?: number): void {
    this.info('API call', {
      method,
      endpoint,
      duration: duration ? `${duration}ms` : undefined
    })
  }

  userAction(action: string, userId: string, metadata?: LogContext): void {
    // Only log user ID in development, never log email or sensitive data
    this.info('User action', {
      action,
      userId: this.isProduction ? '[REDACTED]' : userId,
      ...metadata
    })
  }

  securityEvent(event: string, metadata?: LogContext): void {
    this.warn('Security event', {
      event,
      ...metadata
    })
  }
}

export const logger = new Logger()
