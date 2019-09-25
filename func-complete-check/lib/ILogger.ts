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
