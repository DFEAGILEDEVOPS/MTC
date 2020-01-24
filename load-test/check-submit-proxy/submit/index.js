const lz = require('lz-string')

module.exports = function (context, req) {
  context.log('req.body', JSON.stringify(req.body, null, 2))
  if (req.body) {
    // TODO add answers, audits and inputs...
    const submittedCheck = req.body
    populateWithCheckData(submittedCheck)
    const compressed = lz.compressToUTF16(JSON.stringify(submittedCheck))
    const message = {
      version: 2,
      checkCode: req.body.checkCode,
      archive: compressed,
      schoolUUID: req.body.school.uuid
    }
    context.bindings.submittedCheckQueue = [ message ]
    context.done()
  } else {
    badReq(context, 'no body', 400)
    context.done()
  }
}

const badReq = (context, message, statusCode) => {
  context.res = {
    status: statusCode,
    body: message
  }
}

const populateWithCheckData = (submittedCheck) => {
  submittedCheck.answers = [
    {
      factor1: 2,
      factor2: 5,
      answer: '5',
      sequenceNumber: 1,
      question: '2x5',
      clientTimestamp: '2018-09-24T12:00:00.811Z'
    },
    {
      factor1: 11,
      factor2: 2,
      answer: '5',
      sequenceNumber: 2,
      question: '11x2',
      clientTimestamp: '2018-09-24T12:00:03.963Z'
    },
    {
      factor1: 2,
      factor2: 5,
      answer: '5',
      sequenceNumber: 1,
      question: '2x5',
      clientTimestamp: '2018-09-24T12:00:00.811Z'
    },
    {
      factor1: 11,
      factor2: 2,
      answer: '5',
      sequenceNumber: 2,
      question: '11x2',
      clientTimestamp: '2018-09-24T12:00:03.963Z'
    }
  ]
  submittedCheck.audit = [
    {
      type: 'WarmupStarted',
      clientTimestamp: '2018-09-24T11:59:43.481Z'
    },
    {
      type: 'WarmupIntroRendered',
      clientTimestamp: '2018-09-24T11:59:43.499Z'
    },
    {
      type: 'PauseRendered',
      clientTimestamp: '2018-09-24T11:59:45.352Z',
      data: {
        'practiseSequenceNumber': 1,
        'question': '1x7'
      }
    }
  ]
  submittedCheck.inputs = [
    {
      input: '5',
      eventType: 'keydown',
      clientTimestamp: '2018-09-24T12:00:00.643Z',
      question: '2x5',
      sequenceNumber: 1
    },
    {
      input: 'Enter',
      eventType: 'keydown',
      clientTimestamp: '2018-09-24T12:00:00.810Z',
      question: '2x5',
      sequenceNumber: 1
    },
    {
      input: 'Enter',
      eventType: 'keydown',
      clientTimestamp: '2018-09-24T12:00:00.810Z',
      question: '2x5',
      sequenceNumber: 1
    },
    {
      input: 'Enter',
      eventType: 'keydown',
      clientTimestamp: '2018-09-24T12:00:00.810Z',
      question: '2x5',
      sequenceNumber: 1
    }
  ]
}
