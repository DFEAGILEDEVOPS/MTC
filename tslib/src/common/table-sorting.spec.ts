import tableSorting from './table-sorting'

interface IPerson {
  firstName: string
  lastName: string
  age: number
}

describe('table sorting', () => {
  describe('sortByProps', () => {
    test('sorts as expected', () => {
      const data: IPerson[] = [
        {
          age: 19,
          firstName: 'bob',
          lastName: 'smith'
        },
        {
          age: 19,
          firstName: 'carlie',
          lastName: 'williams'
        },
        {
          age: 19,
          firstName: 'adrian',
          lastName: 'benson'
        },
        {
          age: 19,
          firstName: 'bob',
          lastName: 'jones'
        }
      ]
      const output = tableSorting.sortByProps(['age', 'firstName', 'lastName'], data)
      expect(output).toBeDefined()
      expect(output[0].firstName).toStrictEqual('adrian')
      expect(output[1].firstName).toStrictEqual('bob')
      expect(output[1].lastName).toStrictEqual('jones')
      expect(output[2].firstName).toStrictEqual('bob')
      expect(output[2].lastName).toStrictEqual('smith')
      expect(output[3].firstName).toStrictEqual('carlie')
    })
  })
})
