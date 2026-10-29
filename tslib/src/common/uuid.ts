import { randomUUID } from 'crypto'

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const createUuid = (): string => randomUUID()

export const isValidUuid = (value: unknown): boolean => {
  return typeof value === 'string' && uuidRegex.test(value)
}
