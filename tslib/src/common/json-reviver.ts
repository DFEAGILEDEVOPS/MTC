import moment from 'moment'
const simpleIso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/

/**
 * Reviver function for use with JSON.parse() to instantiate DateTime strings as Moment.moment objects
 * @param key
 * @param value
 */
export function jsonReviver (key: any, value: any): any {
  if (value !== null && value !== undefined && typeof value === 'string') {
    if (simpleIso8601Regex.test(value)) {
      try {
        const d = moment(value)
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (d?.isValid()) {
          return d
        }
      } catch (ignored) {}
    }
  }
  return value
}
