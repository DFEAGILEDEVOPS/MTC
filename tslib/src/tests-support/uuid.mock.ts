let counter = 0

export const validate = (value: unknown): boolean => {
  if (typeof value !== 'string') return false
  return value === '00000000-0000-0000-0000-000000000000' ||
    value.toLowerCase() === 'ffffffff-ffff-ffff-ffff-ffffffffffff' ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export const v4 = (): string => {
  counter++
  const hex = counter.toString(16).padStart(8, '0')
  return `${hex}-0000-4000-8000-000000000000`
}

export const reset = (): void => {
  counter = 0
}
