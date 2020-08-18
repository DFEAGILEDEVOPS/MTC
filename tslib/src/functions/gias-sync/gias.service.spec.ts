import { GiasService } from './gias.service'

let sut: GiasService

describe('GiasSyncService', () => {
  beforeEach(() => {
    sut = new GiasService()
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })
})
