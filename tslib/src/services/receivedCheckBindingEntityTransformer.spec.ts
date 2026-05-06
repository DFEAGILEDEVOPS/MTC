import { type ReceivedCheckFunctionBindingEntity } from '../schemas/models'
import { v4 as uuid } from 'uuid'
import { ReceivedCheckBindingEntityTransformer } from './receivedCheckBindingEntityTransformer'

let sut: ReceivedCheckBindingEntityTransformer

describe('receivedCheckBindingEntityTransformer', () => {
  beforeEach(() => {
    sut = new ReceivedCheckBindingEntityTransformer()
  })

  test('correctly transforms all properties', () => {
    const partitionKey = uuid()
    const rowKey = uuid()
    const archive = uuid()
    const answers = uuid()
    const checkReceivedAt = new Date('1976-01-01 15:00:00')
    const checkVersion = 123
    const isValid = false
    const mark = 456
    const markedAt = new Date('1976-01-01 17:00:00')
    const markError = uuid()
    const maxMarks = 789
    const processingError = uuid()
    const validatedAt = new Date('1976-01-01 16:00:00')
    const input: ReceivedCheckFunctionBindingEntity = {
      PartitionKey: partitionKey,
      RowKey: rowKey,
      archive,
      answers,
      checkReceivedAt,
      checkVersion,
      isValid,
      mark,
      markError,
      markedAt,
      maxMarks,
      processingError,
      validatedAt
    }
    const output = sut.transform(input)
    expect(output.partitionKey).toStrictEqual(partitionKey)
    expect(output.rowKey).toStrictEqual(rowKey)
    expect(output.archive).toStrictEqual(archive)
    expect(output.answers).toStrictEqual(answers)
    expect(output.checkReceivedAt).toStrictEqual(checkReceivedAt)
    expect(output.checkVersion).toStrictEqual(checkVersion)
    expect(output.isValid).toStrictEqual(isValid)
    expect(output.mark).toStrictEqual(mark)
    expect(output.markedAt).toStrictEqual(markedAt)
    expect(output.markError).toStrictEqual(markError)
    expect(output.maxMarks).toStrictEqual(maxMarks)
    expect(output.processingError).toStrictEqual(processingError)
    expect(output.validatedAt).toStrictEqual(validatedAt)
  })
})
