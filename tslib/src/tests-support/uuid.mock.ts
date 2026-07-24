let counter = 0

export const v4 = (): string => {
  counter++
  const hex = counter.toString(16).padStart(8, '0')
  return `${hex}-0000-4000-8000-000000000000`
}

export const reset = (): void => {
  counter = 0
}
