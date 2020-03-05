import { ReceivedCheckViewService, IReceivedCheckViewFunctionBinding } from './received-check-view.service'

let sut: ReceivedCheckViewService

describe('check-view-service', () => {
  beforeEach(() => {
    sut = new ReceivedCheckViewService()
  })

  test('subject should be defined', () => {
    expect(sut).toBeInstanceOf(ReceivedCheckViewService)
  })

  test('returns undefined if no check found in bindings', async () => {
    const bindings: IReceivedCheckViewFunctionBinding = {
      receivedCheck: undefined
    }
    const response = await sut.get(bindings)
    expect(response).toBeUndefined()
  })
})
