
describe('pupil annulment service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('apply annulment', () => {
    test.todo('error is thrown if pupil identifier is not specified')
    test.todo('error is thrown if pupil is not found')
    test.todo('pupil should be frozen when applying annulment')
  })

  describe('remove annulment', () => {
    test.todo('error is thrown if pupil identifier is not specified')
    test.todo('error is thrown if pupil is not found')
    test.todo('frozen status is preserved if specified')
  })
})
