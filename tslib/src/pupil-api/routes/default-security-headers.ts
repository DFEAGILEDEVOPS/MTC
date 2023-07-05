import type { Response } from 'express'

export class DefaultSecurityHeaders {
  static setResponseHeaders (res: Response): void {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Content-Type', 'application/json')
  }
}
