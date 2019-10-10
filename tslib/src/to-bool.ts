export function primitiveToBoolean (value: string | number | boolean | null | undefined): boolean {
  if (value === 'true') {
    return true
  }

  return typeof value === 'string'
    ? !!+value   // we parse string to integer first
    : !!value
}
