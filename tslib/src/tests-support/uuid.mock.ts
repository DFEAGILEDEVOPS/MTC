let counter = 0

export const v4 = (): string => {
  counter++
  const hex = counter.toString(16).padStart(8, '0')
  return `${hex}-0000-4000-8000-000000000000`
}

export const validate = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

export const reset = (): void => {
  counter = 0
}
