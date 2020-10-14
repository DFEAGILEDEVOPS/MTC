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
      expect(output[0].firstName).toEqual('adrian')
      expect(output[1].firstName).toEqual('bob')
      expect(output[1].lastName).toEqual('jones')
      expect(output[2].firstName).toEqual('bob')
      expect(output[2].lastName).toEqual('smith')
      expect(output[3].firstName).toEqual('carlie')
    })
  })
})
