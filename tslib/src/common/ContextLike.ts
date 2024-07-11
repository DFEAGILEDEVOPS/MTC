import { type ILogger } from './logger'

/**
 * @description same signature as Azure Function ContextBindings
 */
export type IContextBindingsLike = Record<string, any>

/**
 * @description Azure Function Context Like object that supports members required
 * by the Ps Report Logger
 */
export interface IContextLike {
  log (...args: any[]): void
  trace (...args: any[]): void
  debug (...args: any[]): void
  info (...args: any[]): void
  warn (...args: any[]): void
  error (...args: any[]): void
  invocationId: string
}
