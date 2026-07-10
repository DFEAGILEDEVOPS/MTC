export function debugLog(message: string, ...args: unknown[]): void {
  if (process.env.PW_DEBUG_LOGS === '1') {
    console.log(message, ...args);
  }
}