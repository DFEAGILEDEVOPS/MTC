export class CheckNotifier {}

let sut: CheckNotifier

describe('check-notifier/v1', () => {

  beforeEach(() => {
    sut = new CheckNotifier()
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })
})
