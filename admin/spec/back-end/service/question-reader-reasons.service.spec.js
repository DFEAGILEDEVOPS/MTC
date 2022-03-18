'use strict'
/* global describe expect test jest afterEach */

const questionReaderReasonsDataService = require('../../../services/data-access/question-reader-reasons.data.service')
const questionReaderReasonsService = require('../../../services/question-reader-reasons.service')

describe('question-reader-reason.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getQuestionReaderReasons', () => {
    test('should call sqlFindQuestionReaderReasons', async () => {
      jest.spyOn(questionReaderReasonsDataService, 'sqlFindQuestionReaderReasons').mockImplementation()
      await questionReaderReasonsService.getQuestionReaderReasons()
      expect(questionReaderReasonsDataService.sqlFindQuestionReaderReasons).toHaveBeenCalled()
    })
  })
})
