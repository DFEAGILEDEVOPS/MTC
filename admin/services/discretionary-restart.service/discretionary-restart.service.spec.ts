import { DiscretionaryRestartService } from './discretionary-restart.service'
import { DiscretionaryRestartDataService } from './data-access/discretionary-restart.data.service'
import * as uuid from 'uuid'

describe('DiscretationryRestartService', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('grantDiscretionaryRestart', () => {
    test('it validates that a uuid has been passed in', async () => {
      await expect(DiscretionaryRestartService.grantDiscretionaryRestart('not a valid uuid')).rejects.toThrow(/Invalid uuid/)
    })

    test('it calls the data service', async () => {
      jest.spyOn(DiscretionaryRestartDataService, 'sqlGrantDiscretionaryRestart').mockImplementation()
      await DiscretionaryRestartService.grantDiscretionaryRestart(uuid.v4())
      expect(DiscretionaryRestartDataService.sqlGrantDiscretionaryRestart).toHaveBeenCalled()
    })
  })
})
