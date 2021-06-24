export default {
  version: 1,
  answers: [
    {
      factor1: 2,
      factor2: 5,
      answer: 5,
      sequenceNumber: 1,
      question: '2x5',
      clientTimestamp: '2018-09-24T12:00:00.811Z'
    },
    {
      factor1: 11,
      factor2: 2,
      answer: 5,
      sequenceNumber: 2,
      question: '11x2',
      clientTimestamp: '2018-09-24T12:00:03.963Z'
    }
  ],
  audit: [
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
        practiseSequenceNumber: 1,
        question: '1x7'
      }
    },
    {
      type: 'QuestionRendered',
      clientTimestamp: '2018-09-24T11:59:48.360Z',
      data: {
        practiseSequenceNumber: 1,
        question: '1x7'
      }
    },
    {
      type: 'QuestionTimerStarted',
      clientTimestamp: '2018-09-24T11:59:48.360Z',
      data: {
        sequenceNumber: 1,
        question: '1x7'
      }
    },
    {
      type: 'QuestionTimerCancelled',
      clientTimestamp: '2018-09-24T11:59:48.554Z',
      data: {
        sequenceNumber: 1,
        question: '1x7'
      }
    },
    {
      type: 'QuestionAnswered',
      clientTimestamp: '2018-09-24T11:59:48.554Z',
      data: {
        practiseSequenceNumber: 1,
        question: '1x7'
      }
    },
    {
      type: 'QuestionRendered',
      clientTimestamp: '2018-09-24T12:00:24.475Z',
      data: {
        sequenceNumber: 8,
        question: '4x9'
      }
    }
  ],
  config: {
    questionTime: 6,
    loadingTime: 3,
    speechSynthesis: false,
    audibleSounds: false,
    numpadRemoval: false,
    fontSize: false,
    colourContrast: false
  },
  device: {
    battery: {
      isCharging: true,
      levelPercent: 100,
      chargingTime: 0,
      dischargingTime: null
    },
    cpu: {
      hardwareConcurrency: 8
    },
    navigator: {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
      platform: 'MacIntel',
      language: 'en-US',
      cookieEnabled: true,
      doNotTrack: null
    },
    networkConnection: {
      downlink: 10,
      effectiveType: '4g',
      rtt: 50
    },
    screen: {
      screenWidth: 1680,
      screenHeight: 1050,
      outerWidth: 1680,
      outerHeight: 949,
      innerWidth: 760,
      innerHeight: 949,
      colorDepth: 24,
      orientation: 'landscape-primary'
    }
  },
  inputs: [
    {
      input: 5,
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
      clientTimestamp: '2018-09-24T12:00:03.818Z',
      question: '11x2',
      sequenceNumber: 2
    }
  ],
  pupil: {
    checkCode: '5AFDD0DD-AF49-4D24-B72D-B711F9EFCFAC'
  },
  questions: [
    {
      order: 1,
      factor1: 2,
      factor2: 5
    },
    {
      order: 2,
      factor1: 11,
      factor2: 2
    },
    {
      order: 3,
      factor1: 5,
      factor2: 10
    }
  ],
  school: {
    id: 2,
    name: 'Example School One'
  },
  tokens: {
    checkStarted: {
      token: 'st=2018-09-24T09%3A26%3A31Z&se=2018-09-24T21%3A31%3A31Z&sp=a&sv=2018-03-28&sig=xxx%3D',
      url: 'https://myqueue.queue.core.windows.net/check-started'
    },
    pupilPreferences: {
      token: 'st=2018-09-24T09%3A26%3A31Z&se=2018-09-24T21%3A31%3A31Z&sp=a&sv=2018-03-28&sig=xxx%3D',
      url: 'https://myqueue.queue.core.windows.net/pupil-prefs'
    },
    checkComplete: {
      token: 'st=2018-09-24T09%3A26%3A31Z&se=2018-09-24T21%3A31%3A31Z&sp=a&sv=2018-03-28&sig=xxxBI%3D',
      url: 'https://myqueue.queue.core.windows.net/check-complete'
    },
    pupilFeedback: {
      token: 'st=2018-09-24T09%3A26%3A31Z&se=2018-09-24T21%3A31%3A31Z&sp=a&sv=2018-03-28&sig=xxxc%3D',
      url: 'https://myqueue.queue.core.windows.net/pupil-feedback'
    },
    jwt: {
      token: 'xxx.jwt.xxx'
    }
  },
  checkCode: '5AFDD0DD-AF49-4D24-B72D-B711F9EFCFAC'
}
