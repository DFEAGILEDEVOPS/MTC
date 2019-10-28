/**
 * Generic logger contract
 */
export interface ILogger {
  /**
   * Writes to error level logging or lower.
   */
  error (...args: any[]): void
  /**
   * Writes to warning level logging or lower.
   */
  warn (...args: any[]): void
  /**
   * Writes to info level logging or lower.
   */
  info (...args: any[]): void
  /**
   * Writes to verbose level logging.
   */
  verbose (...args: any[]): void
}

export class ConsoleLogger implements ILogger {
  error (...args: any[]): void {
    console.error(...args)
  }

  warn (...args: any[]): void {
    console.warn(...args)
  }
  info (...args: any[]): void {
    console.info(...args)
  }
  verbose (...args: any[]): void {
    console.log(...args)
  }
}
