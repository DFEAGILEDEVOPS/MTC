import { sort } from 'ramda'

interface ISequenceSortable {
  sequenceNumber?: number
}

/**
 * This interface has to meet both Answers and Inputs/Events, which are slightly different, as inputs and events have all
 * extra data in a `data` structure.
 */
interface ISortableItem {
  clientTimestamp: string
  data?: {
    monotonicTime?: ISequenceSortable
  }
  monotonicTime?: ISequenceSortable
}

/**
 * Comparator function to sort Answer, Events or Inputs.
 *
 *  Returns a negative number if the first value is smaller, a positive number if it's larger, and zero if they are equal. Please note
 *  that this is a copy of the list. It does not modify the original.
 *
 * @param ISortableItem a
 * @param ISortableItem b
 * @return number
 */
const comparator = (a: ISortableItem, b: ISortableItem): number => {
  const diff = (new Date(a.clientTimestamp)).getTime() - (new Date(b.clientTimestamp)).getTime()
  if (diff === 0) {
    // Sub-sort by sequenceNumber added from the SPA MonotonicTimeService
    const aMonotonicTime = a?.monotonicTime?.sequenceNumber ?? a?.data?.monotonicTime?.sequenceNumber
    const bMonotonicTime = b?.monotonicTime?.sequenceNumber ?? b?.data?.monotonicTime?.sequenceNumber
    if (aMonotonicTime !== undefined && bMonotonicTime !== undefined) {
      return aMonotonicTime - bMonotonicTime
    }
  }
  return diff
}

/**
 * Sort an array of Answers, Inputs, or Events.  Assumes the clientTimestamp is still a string. Please note
 * that this returns a copy of the list. It does not modify the original.
 * @param items
 */
export function payloadSort<Type extends ISortableItem> (items: Type[]): Type[] {
  return sort(comparator, items)
}
