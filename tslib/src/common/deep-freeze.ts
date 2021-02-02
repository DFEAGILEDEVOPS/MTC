export function deepFreeze <T> (obj: T): T {
  if (typeof obj !== 'object') {
    return obj
  }
  if (obj === null) {
    return obj
  }
  const properties = Object.getOwnPropertyNames(obj)
  for (const name of properties) {
    // @ts-ignore - ignore any return type
    const value: any = obj[name]
    if (value !== null && value !== undefined && typeof value === 'object') {
      deepFreeze(value)
    }
  }
  return Object.freeze(obj)
}
