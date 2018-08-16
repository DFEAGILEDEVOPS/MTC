'use strict'
/* global describe expect it spyOn */

const questionReaderReasonsDataService = require('../../../services/data-access/question-reader-reasons.data.service')
const questionReaderReasonsService = require('../../../services/question-reader-reasons.service')

describe('question-reader-reason.service', () => {
  describe('getQuestionReaderReasons', () => {
    it('should call sqlFindQuestionReaderReasons', async () => {
      spyOn(questionReaderReasonsDataService, 'sqlFindQuestionReaderReasons')
      await questionReaderReasonsService.getQuestionReaderReasons()
      expect(questionReaderReasonsDataService.sqlFindQuestionReaderReasons).toHaveBeenCalled()
    })
  })
})
