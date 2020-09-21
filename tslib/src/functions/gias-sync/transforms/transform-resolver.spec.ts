import { SchoolTransformResolver } from './transform-resolver'

let sut: SchoolTransformResolver

describe('school transform resolver', () => {
  beforeEach(() => {
    sut = new SchoolTransformResolver()
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('returns null transformer when matching no link found', () => {
    const transformer = sut.resolve(undefined)
    expect(transformer.constructor.name).toEqual('NullTransformer')
  })

  test('returns predecessor transformer when matching link type identified', () => {
    const transformer = sut.resolve({
      EstablishedDate: new Date(),
      LinkType: {
        Code: 1,
        DisplayName: 'Predecessor'
      },
      LinkUrn: 123
    })
    expect(transformer.constructor.name).toEqual('PredecessorTransformer')
  })

  test('returns successor transformer when matching link type identified', () => {
    const transformer = sut.resolve({
      EstablishedDate: new Date(),
      LinkType: {
        Code: 2,
        DisplayName: 'Successor'
      },
      LinkUrn: 123
    })
    expect(transformer.constructor.name).toEqual('SuccessorTransformer')
  })
})
