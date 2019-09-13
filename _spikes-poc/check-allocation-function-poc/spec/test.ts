const obj = {}
const noObj = undefined

describe('MyApi getName function return value', () => {
  it('Should be defined.', () => {
    expect(obj).toBeDefined('The function getName() should be defined.')
  })

  it('should fail', () => {
    expect(noObj).not.toBeDefined('The function getName() should return the name.')
  })
})
