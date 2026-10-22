import { type ServiceBusReceiver, type ServiceBusReceivedMessage } from '@azure/service-bus'
import { MockLogger } from '../../common/logger'
import { DlqReconciliationService } from './dlq-reconciliation.service'
import { DlqReconciliationDataService } from './dlq-reconciliation.data.service'
import { type ReconciliationItem } from './models'

describe('DLQ reconciliation', () => {
  const checkCode = 'f3f36f0e-ec74-4ef3-a65f-a3fa9d80b376'
  const otherCheckCode = 'bb2fb48e-19df-42d8-a29d-2814061e5cac'
  let receiver: Pick<ServiceBusReceiver, 'peekMessages' | 'receiveMessages' | 'completeMessage' | 'abandonMessage'>
  let dataService: { isSynchronised: jest.Mock, heartbeat: jest.Mock, recordInventory: jest.Mock, recordOutcome: jest.Mock }
  let sut: DlqReconciliationService

  function sequence (value: number): ServiceBusReceivedMessage['sequenceNumber'] {
    return { toString: () => String(value), add: (amount: number) => sequence(value + amount) } as ServiceBusReceivedMessage['sequenceNumber']
  }

  function message (body: unknown, number = 1): ServiceBusReceivedMessage {
    return { body, messageId: 'duplicate-id', sequenceNumber: sequence(number) } as ServiceBusReceivedMessage
  }

  function submission (): object {
    return { version: 4, checkCode, schoolUUID: otherCheckCode, archive: 'not decoded by reconciler' }
  }

  function eligible (number = 1): ReconciliationItem {
    return { sequenceNumber: String(number), messageId: 'duplicate-id', checkCode, schoolUUID: otherCheckCode, outcome: 'Eligible' }
  }

  beforeEach(() => {
    receiver = {
      peekMessages: jest.fn().mockResolvedValue([]),
      receiveMessages: jest.fn().mockResolvedValue([]),
      completeMessage: jest.fn().mockResolvedValue(undefined),
      abandonMessage: jest.fn().mockResolvedValue(undefined)
    }
    dataService = {
      isSynchronised: jest.fn().mockResolvedValue(true),
      heartbeat: jest.fn().mockResolvedValue(undefined),
      recordInventory: jest.fn().mockResolvedValue(undefined),
      recordOutcome: jest.fn().mockResolvedValue(undefined)
    }
    sut = new DlqReconciliationService(new MockLogger(), dataService)
  })

  test('previews more than 100 messages without settling or receiving them', async () => {
    const messages = Array.from({ length: 250 }, (_, index) => message(submission(), index + 1))
    jest.mocked(receiver.peekMessages).mockResolvedValueOnce(messages.slice(0, 100))
      .mockResolvedValueOnce(messages.slice(100, 200)).mockResolvedValueOnce(messages.slice(200))
    expect(await sut.preview(receiver, checkCode)).toMatchObject({ status: 'Completed' })
    expect(dataService.recordInventory.mock.calls.flatMap(call => call[1])).toHaveLength(250)
    expect(receiver.peekMessages).toHaveBeenNthCalledWith(2, 100, { fromSequenceNumber: expect.objectContaining({ toString: expect.any(Function) }) })
    expect(dataService.isSynchronised).toHaveBeenCalledWith(checkCode, otherCheckCode)
    expect(receiver.receiveMessages).not.toHaveBeenCalled()
    expect(receiver.completeMessage).not.toHaveBeenCalled()
  })

  test.each([JSON.stringify(submission()), Buffer.from(JSON.stringify(submission()))])('accepts encoded submission envelopes', async body => {
    jest.mocked(receiver.peekMessages).mockResolvedValueOnce([message(body)])
    await sut.preview(receiver, checkCode)
    expect(dataService.recordInventory).toHaveBeenCalledWith(checkCode, [expect.objectContaining({ outcome: 'Eligible', checkCode })])
  })

  test('records the queue submission time even for a malformed message', async () => {
    const submitted = { ...message('not-json'), enqueuedTimeUtc: new Date('2026-10-19T08:15:30.000Z') }
    jest.mocked(receiver.peekMessages).mockResolvedValueOnce([submitted])
    await sut.preview(receiver, checkCode)
    expect(dataService.recordInventory).toHaveBeenCalledWith(checkCode, [expect.objectContaining({
      submittedAt: '2026-10-19T08:15:30.000Z', outcome: 'Retained: invalid submission envelope'
    })])
  })

  test('does not invent a submission date when queue metadata is absent', async () => {
    jest.mocked(receiver.peekMessages).mockResolvedValueOnce([message(submission())])
    await sut.preview(receiver, checkCode)
    expect(dataService.recordInventory).toHaveBeenCalledWith(checkCode, [expect.objectContaining({ submittedAt: null })])
  })

  test('retains envelopes without usable identifiers without querying SQL', async () => {
    const messages = ['not-json', 'null', null, {}, { version: 4, checkCode: 'invalid', schoolUUID: otherCheckCode }]
      .map((body, index) => message(body, index + 1))
    jest.mocked(receiver.peekMessages).mockResolvedValueOnce(messages)
    await sut.preview(receiver, checkCode)
    expect(dataService.recordInventory.mock.calls[0][1]).toHaveLength(5)
    expect(dataService.isSynchronised).not.toHaveBeenCalled()
  })

  test.each([
    { version: 0, checkCode, schoolUUID: otherCheckCode },
    JSON.stringify({ version: 0, checkCode, schoolUUID: otherCheckCode }),
    Buffer.from(JSON.stringify({ version: 3, checkCode, schoolUUID: otherCheckCode })),
    { checkCode, schoolUUID: otherCheckCode }
  ])('marks submissions eligible regardless of version when SQL confirms success', async body => {
    jest.mocked(receiver.peekMessages).mockResolvedValueOnce([message(body)])
    await sut.preview(receiver, checkCode)
    expect(dataService.recordInventory).toHaveBeenCalledWith(checkCode, [expect.objectContaining({
      checkCode,
      schoolUUID: otherCheckCode,
      outcome: 'Eligible'
    })])
    expect(dataService.isSynchronised).toHaveBeenCalledWith(checkCode, otherCheckCode)
    expect(receiver.completeMessage).not.toHaveBeenCalled()
  })

  test.each([0, 3, 4, undefined])('retains version %s when SQL does not confirm success', async version => {
    jest.mocked(receiver.peekMessages).mockResolvedValueOnce([message({ version, checkCode, schoolUUID: otherCheckCode })])
    dataService.isSynchronised.mockResolvedValue(false)
    await sut.preview(receiver, checkCode)
    expect(dataService.recordInventory).toHaveBeenCalledWith(checkCode, [expect.objectContaining({
      checkCode, outcome: 'Retained: no matching successful SQL result'
    })])
    expect(receiver.completeMessage).not.toHaveBeenCalled()
  })

  test.each([undefined, 'invalid-school'])('preserves a valid check code when school UUID is %s', async schoolUUID => {
    jest.mocked(receiver.peekMessages).mockResolvedValueOnce([message({ version: 4, checkCode: checkCode.toUpperCase(), schoolUUID })])
    await sut.preview(receiver, checkCode)
    expect(dataService.recordInventory).toHaveBeenCalledWith(checkCode, [expect.objectContaining({
      checkCode,
      outcome: 'Retained: invalid submission envelope'
    })])
    expect(dataService.recordInventory.mock.calls[0][1][0].schoolUUID).toBeUndefined()
    expect(dataService.isSynchronised).not.toHaveBeenCalled()
  })

  test('does not copy invalid check-code values into the audit', async () => {
    jest.mocked(receiver.peekMessages).mockResolvedValueOnce([message({ version: 0, checkCode: 'invalid', schoolUUID: otherCheckCode })])
    await sut.preview(receiver, checkCode)
    expect(dataService.recordInventory.mock.calls[0][1][0].checkCode).toBeUndefined()
    expect(dataService.recordInventory.mock.calls[0][1][0].schoolUUID).toBe(otherCheckCode)
  })

  test('reports partial when the inventory limit is exceeded', async () => {
    jest.mocked(receiver.peekMessages).mockResolvedValueOnce([message(submission(), 1), message(submission(), 2)])
    expect(await sut.preview(receiver, checkCode, { maxMessages: 1 })).toMatchObject({ status: 'Partial' })
    expect(dataService.recordInventory.mock.calls[0][1]).toHaveLength(1)
  })

  test('holds unresolved messages until later candidates have been processed', async () => {
    const retained = message({}, 1)
    const first = message(submission(), 2)
    const second = message(submission(), 3)
    jest.mocked(receiver.receiveMessages).mockResolvedValueOnce([retained, first]).mockResolvedValueOnce([second])
    jest.mocked(receiver.abandonMessage).mockImplementation(async () => {
      expect(receiver.completeMessage).toHaveBeenCalledTimes(2)
    })
    expect(await sut.cleanup(receiver, checkCode, [eligible(2), eligible(3)])).toMatchObject({ status: 'Completed' })
    expect(receiver.completeMessage).toHaveBeenNthCalledWith(1, first)
    expect(receiver.completeMessage).toHaveBeenNthCalledWith(2, second)
    expect(receiver.abandonMessage).toHaveBeenCalledWith(retained)
    expect(dataService.recordOutcome).toHaveBeenCalledTimes(4)
  })

  test('rechecks SQL success immediately before removal', async () => {
    jest.mocked(receiver.receiveMessages).mockResolvedValueOnce([message(submission())])
    dataService.isSynchronised.mockResolvedValue(false)
    await sut.cleanup(receiver, checkCode, [eligible()])
    expect(receiver.completeMessage).not.toHaveBeenCalled()
    expect(dataService.recordOutcome).toHaveBeenCalledWith(checkCode, expect.objectContaining({ outcome: 'Retained: no matching successful SQL result' }))
  })

  test('matches SQL uppercase GUIDs against the same message identifiers during cleanup', async () => {
    const received = message({ version: 0, checkCode, schoolUUID: otherCheckCode })
    const preview = { ...eligible(), checkCode: checkCode.toUpperCase(), schoolUUID: otherCheckCode.toUpperCase() }
    jest.mocked(receiver.receiveMessages).mockResolvedValueOnce([received])
    expect(await sut.cleanup(receiver, checkCode, [preview])).toMatchObject({ status: 'Completed' })
    expect(dataService.isSynchronised).toHaveBeenCalledWith(checkCode, otherCheckCode)
    expect(receiver.completeMessage).toHaveBeenCalledWith(received)
    expect(receiver.abandonMessage).not.toHaveBeenCalled()
    expect(dataService.recordOutcome).toHaveBeenLastCalledWith(checkCode, expect.objectContaining({ outcome: 'Removed' }))
  })

  test('removes an unsupported submission when the same check is still synchronised in SQL', async () => {
    const unsupported = message({ version: 0, checkCode, schoolUUID: otherCheckCode })
    jest.mocked(receiver.receiveMessages).mockResolvedValueOnce([unsupported])
    await sut.cleanup(receiver, checkCode, [eligible()])
    expect(dataService.isSynchronised).toHaveBeenCalledWith(checkCode, otherCheckCode)
    expect(receiver.completeMessage).toHaveBeenCalledWith(unsupported)
    expect(receiver.abandonMessage).not.toHaveBeenCalled()
    expect(dataService.recordOutcome).toHaveBeenLastCalledWith(checkCode, expect.objectContaining({ outcome: 'Removed' }))
  })

  test('retains an unsupported submission if SQL success changes after preview', async () => {
    const unsupported = message({ version: 0, checkCode, schoolUUID: otherCheckCode })
    jest.mocked(receiver.receiveMessages).mockResolvedValueOnce([unsupported])
    dataService.isSynchronised.mockResolvedValue(false)
    await sut.cleanup(receiver, checkCode, [eligible()])
    expect(receiver.completeMessage).not.toHaveBeenCalled()
    expect(receiver.abandonMessage).toHaveBeenCalledWith(unsupported)
  })

  test('does not remove a message whose school differs from the preview', async () => {
    const differentSchool = message({ version: 0, checkCode, schoolUUID: checkCode })
    jest.mocked(receiver.receiveMessages).mockResolvedValueOnce([differentSchool])
    await sut.cleanup(receiver, checkCode, [eligible()])
    expect(dataService.isSynchronised).not.toHaveBeenCalled()
    expect(receiver.completeMessage).not.toHaveBeenCalled()
    expect(receiver.abandonMessage).toHaveBeenCalledWith(differentSchool)
  })

  test('cleans hundreds of candidates behind retained messages in one bounded sweep', async () => {
    const messages = Array.from({ length: 250 }, (_, index) => message(submission(), index + 1))
    const inventory = messages.map((unused, index) => ({ ...eligible(index + 1), outcome: index < 100 ? 'Retained: no matching successful SQL result' : 'Eligible' }))
    jest.mocked(receiver.receiveMessages).mockResolvedValueOnce(messages.slice(0, 100))
      .mockResolvedValueOnce(messages.slice(100, 200)).mockResolvedValueOnce(messages.slice(200))
    expect(await sut.cleanup(receiver, checkCode, inventory)).toMatchObject({ status: 'Completed' })
    expect(receiver.completeMessage).toHaveBeenCalledTimes(150)
    expect(receiver.abandonMessage).toHaveBeenCalledTimes(100)
    expect(dataService.recordOutcome).toHaveBeenCalledTimes(300)
  })

  test('does not report a complete preview when SQL verification fails', async () => {
    jest.mocked(receiver.peekMessages).mockResolvedValueOnce([message(submission())])
    dataService.isSynchronised.mockRejectedValue(new Error('SQL unavailable'))
    expect(await sut.preview(receiver, checkCode)).toMatchObject({ status: 'Partial' })
    expect(receiver.completeMessage).not.toHaveBeenCalled()
    expect(dataService.recordInventory).toHaveBeenCalledWith(checkCode, [expect.objectContaining({ outcome: 'Failed: SQL verification unavailable' })])
  })

  test('does not settle a message if writing removal intent fails', async () => {
    jest.mocked(receiver.receiveMessages).mockResolvedValueOnce([message(submission())])
    dataService.recordOutcome.mockRejectedValue(new Error('Audit unavailable'))
    await expect(sut.cleanup(receiver, checkCode, [eligible()])).rejects.toThrow('Audit unavailable')
    expect(receiver.completeMessage).not.toHaveBeenCalled()
    expect(receiver.abandonMessage).toHaveBeenCalledTimes(1)
  })

  test('records an uncertain settlement without claiming removal', async () => {
    jest.mocked(receiver.receiveMessages).mockResolvedValueOnce([message(submission())])
    jest.mocked(receiver.completeMessage).mockRejectedValue(new Error('Lock expired'))
    expect(await sut.cleanup(receiver, checkCode, [eligible()])).toMatchObject({ status: 'Partial' })
    expect(dataService.recordOutcome).toHaveBeenCalledTimes(1)
    expect(dataService.recordOutcome).toHaveBeenCalledWith(checkCode, expect.objectContaining({ outcome: 'Unknown: removal pending confirmation' }))
  })

  test('marks the run partial when previewed candidates cannot be received', async () => {
    expect(await sut.cleanup(receiver, checkCode, [eligible()])).toMatchObject({ status: 'Partial' })
    expect(receiver.completeMessage).not.toHaveBeenCalled()
  })

  test('never removes messages absent from the preview snapshot', async () => {
    const newMessage = message(submission(), 2)
    jest.mocked(receiver.receiveMessages).mockResolvedValueOnce([newMessage])
    await sut.cleanup(receiver, checkCode, [eligible(1)])
    expect(receiver.completeMessage).not.toHaveBeenCalled()
    expect(receiver.abandonMessage).toHaveBeenCalledWith(newMessage)
  })

  test('does not remove anything when the time limit has already elapsed', async () => {
    expect(await sut.cleanup(receiver, checkCode, [eligible()], { maxDurationMs: 0 })).toMatchObject({ status: 'Partial' })
    expect(receiver.receiveMessages).not.toHaveBeenCalled()
  })

  test('retains candidates if SQL is unavailable during cleanup', async () => {
    jest.mocked(receiver.receiveMessages).mockResolvedValueOnce([message(submission())])
    dataService.isSynchronised.mockRejectedValue(new Error('SQL unavailable'))
    expect(await sut.cleanup(receiver, checkCode, [eligible()])).toMatchObject({ status: 'Partial' })
    expect(receiver.completeMessage).not.toHaveBeenCalled()
  })

  test.each([true, 1, false, 0, null, undefined])('only trusts an explicit SQL success flag: %s', async flag => {
    const query = jest.fn().mockResolvedValue([{ resultsSynchronised: flag }])
    const service = new DlqReconciliationDataService({ query })
    expect(await service.isSynchronised(checkCode, otherCheckCode)).toBe(flag === true || flag === 1)
    expect(query).toHaveBeenCalledWith(expect.stringContaining('WHERE checkCode=@checkCode'), [
      expect.objectContaining({ name: 'checkCode', value: checkCode }),
      expect.objectContaining({ name: 'schoolUUID', value: otherCheckCode })
    ])
    expect(query.mock.calls[0][0]).not.toContain('mtc_results')
  })

  test('does not treat a missing database record as success', async () => {
    const service = new DlqReconciliationDataService({ query: jest.fn().mockResolvedValue([]) })
    expect(await service.isSynchronised(checkCode, otherCheckCode)).toBe(false)
  })

  test('includes the stored checked timestamp in paged audit results', async () => {
    const items = [{ ...eligible(), checkedAt: '2026-10-20T12:30:45.000Z' }]
    const query = jest.fn().mockResolvedValue(items)
    const service = new DlqReconciliationDataService({ query })
    expect(await service.getItems(checkCode, 2)).toStrictEqual(items)
    expect(query).toHaveBeenCalledWith(expect.stringContaining('schoolUUID, checkedAt, submittedAt, outcome'), [
      expect.objectContaining({ name: 'runId', value: checkCode }),
      expect.objectContaining({ name: 'offset', value: 50 })
    ])
  })

  test('preserves submission timestamps when copying preview inventory into cleanup', async () => {
    const item = { ...eligible(), submittedAt: '2026-10-19T08:15:30.000Z' }
    jest.mocked(receiver.receiveMessages).mockResolvedValueOnce([message(submission())])
    await sut.cleanup(receiver, checkCode, [item])
    expect(dataService.recordInventory).toHaveBeenCalledWith(checkCode, [expect.objectContaining({ submittedAt: item.submittedAt })])
  })
})