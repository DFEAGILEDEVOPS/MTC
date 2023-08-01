export function primitiveToBoolean (value: string | number | boolean | null | undefined | unknown): boolean {
  switch (value) {
    case true:
    case 'true':
    case '1':
    case 1:
      return true
    default:
      return false
  }
}

export function propertyExists (value: Record<string, unknown>, property: string): boolean {
  return {}.hasOwnProperty.call(value, property)
}

export type StringOrNumber = string | number

export function valueOrSubstitute (input: unknown, substitute: string | number): string {
  if (typeof input === 'number') return input.toString()
  if (typeof input === 'string' && input.length > 0) return input

  if (input !== '' && input !== undefined && input !== null) {
    return String(input)
  }
  return substitute.toString()
}
