export const mockCompletionCheckMessage = {
  validatedCheck: {
    checkCode: 'B12FB2D0-F259-4684-91D2-C73D01F7D458',
    schoolUUID: '5A499181-8FD6-4D83-A324-6FDCEAFE468C',
    config: {
      audibleSounds: false,
      checkTime: 30,
      colourContrast: false,
      fontSize: false,
      inputAssistance: false,
      loadingTime: 3,
      nextBetweenQuestions: false,
      numpadRemoval: false,
      practice: false,
      questionReader: false,
      questionTime: 6,
      compressCompletedCheck: true
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
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
        platform: 'MacIntel',
        language: 'en-GB',
        cookieEnabled: true,
        doNotTrack: null
      },
      networkConnection: {
        downlink: 10,
        effectiveType: '4g',
        rtt: 0
      },
      screen: {
        screenWidth: 3840,
        screenHeight: 1600,
        outerWidth: 1716,
        outerHeight: 1299,
        innerWidth: 1037,
        innerHeight: 1299,
        colorDepth: 24,
        orientation: 'landscape-primary'
      },
      appUsageCounter: 1
    },
    pupil: {
      checkCode: 'B12FB2D0-F259-4684-91D2-C73D01F7D458'
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
      },
      {
        order: 4,
        factor1: 4,
        factor2: 4
      },
      {
        order: 5,
        factor1: 3,
        factor2: 9
      },
      {
        order: 6,
        factor1: 2,
        factor2: 4
      },
      {
        order: 7,
        factor1: 3,
        factor2: 3
      },
      {
        order: 8,
        factor1: 4,
        factor2: 9
      },
      {
        order: 9,
        factor1: 6,
        factor2: 5
      },
      {
        order: 10,
        factor1: 12,
        factor2: 12
      }
    ],
    school: {
      name: 'Example School One',
      uuid: '5A499181-8FD6-4D83-A324-6FDCEAFE468C'
    },
    tokens: {
      checkStarted: {
        token: 'st=2020-09-29T12%3A20%3A01Z&se=2020-09-30T13%3A25%3A01Z&sp=a&sv=2018-03-28&sig=dqX9o9TM2CJW2DAtNdyiHbPXr8mBvlwgpkNrVKDVmTw%3D',
        url: 'https://strgt1dvmtcjs.queue.core.windows.net/check-started',
        queueName: 'check-started'
      },
      pupilPreferences: {
        token: 'st=2020-09-29T12%3A20%3A01Z&se=2020-09-30T13%3A25%3A01Z&sp=a&sv=2018-03-28&sig=Z1MefP0F4vkTwJ%2F5Wyl2b4ZndHC1nSg893GBpKrTsU4%3D',
        url: 'https://strgt1dvmtcjs.queue.core.windows.net/pupil-prefs',
        queueName: 'pupil-prefs'
      },
      pupilFeedback: {
        token: 'st=2020-09-29T12%3A20%3A01Z&se=2020-09-30T13%3A25%3A01Z&sp=a&sv=2018-03-28&sig=iMI45ep3FT6LxRrMg%2FACDBffT0NAZUbdr8q0Km%2FldoA%3D',
        url: 'https://strgt1dvmtcjs.queue.core.windows.net/pupil-feedback',
        queueName: 'pupil-feedback'
      },
      checkSubmission: {
        token: 'string',
        url: 'string'
      }
    },
    audit: [
      {
        type: 'WarmupStarted',
        clientTimestamp: '2020-09-29T12:25:26.657Z'
      },
      {
        type: 'WarmupIntroRendered',
        clientTimestamp: '2020-09-29T12:25:26.675Z'
      },
      {
        type: 'PauseRendered',
        clientTimestamp: '2020-09-29T12:25:27.720Z',
        data: {
          practiseSequenceNumber: 1,
          question: '1x12'
        }
      },
      {
        type: 'QuestionTimerStarted',
        clientTimestamp: '2020-09-29T12:25:30.733Z',
        data: {
          sequenceNumber: 1,
          question: '1x12'
        }
      },
      {
        type: 'QuestionRendered',
        clientTimestamp: '2020-09-29T12:25:30.733Z',
        data: {
          practiseSequenceNumber: 1,
          question: '1x12'
        }
      },
      {
        type: 'QuestionTimerCancelled',
        clientTimestamp: '2020-09-29T12:25:33.030Z',
        data: {
          sequenceNumber: 1,
          question: '1x12'
        }
      },
      {
        type: 'QuestionAnswered',
        clientTimestamp: '2020-09-29T12:25:33.031Z',
        data: {
          practiseSequenceNumber: 1,
          question: '1x12'
        }
      },
      {
        type: 'PauseRendered',
        clientTimestamp: '2020-09-29T12:25:33.034Z',
        data: {
          practiseSequenceNumber: 2,
          question: '2x2'
        }
      },
      {
        type: 'QuestionTimerStarted',
        clientTimestamp: '2020-09-29T12:25:36.041Z',
        data: {
          sequenceNumber: 2,
          question: '2x2'
        }
      },
      {
        type: 'QuestionRendered',
        clientTimestamp: '2020-09-29T12:25:36.041Z',
        data: {
          practiseSequenceNumber: 2,
          question: '2x2'
        }
      },
      {
        type: 'QuestionTimerCancelled',
        clientTimestamp: '2020-09-29T12:25:37.242Z',
        data: {
          sequenceNumber: 2,
          question: '2x2'
        }
      },
      {
        type: 'QuestionAnswered',
        clientTimestamp: '2020-09-29T12:25:37.242Z',
        data: {
          practiseSequenceNumber: 2,
          question: '2x2'
        }
      },
      {
        type: 'PauseRendered',
        clientTimestamp: '2020-09-29T12:25:37.245Z',
        data: {
          practiseSequenceNumber: 3,
          question: '10x10'
        }
      },
      {
        type: 'QuestionTimerStarted',
        clientTimestamp: '2020-09-29T12:25:40.252Z',
        data: {
          sequenceNumber: 3,
          question: '10x10'
        }
      },
      {
        type: 'QuestionRendered',
        clientTimestamp: '2020-09-29T12:25:40.252Z',
        data: {
          practiseSequenceNumber: 3,
          question: '10x10'
        }
      },
      {
        type: 'QuestionAnswered',
        clientTimestamp: '2020-09-29T12:25:41.521Z',
        data: {
          practiseSequenceNumber: 3,
          question: '10x10'
        }
      },
      {
        type: 'QuestionTimerCancelled',
        clientTimestamp: '2020-09-29T12:25:41.521Z',
        data: {
          sequenceNumber: 3,
          question: '10x10'
        }
      },
      {
        type: 'WarmupCompleteRendered',
        clientTimestamp: '2020-09-29T12:25:41.525Z'
      },
      {
        type: 'QuestionIntroRendered',
        clientTimestamp: '2020-09-29T12:25:42.622Z'
      },
      {
        type: 'CheckStarted',
        clientTimestamp: '2020-09-29T12:25:43.838Z'
      },
      {
        type: 'CheckStartedApiCalled',
        clientTimestamp: '2020-09-29T12:25:43.840Z'
      },
      {
        type: 'PauseRendered',
        clientTimestamp: '2020-09-29T12:25:43.851Z',
        data: {
          sequenceNumber: 1,
          question: '2x5'
        }
      },
      {
        type: 'CheckStartedAPICallSucceeded',
        clientTimestamp: '2020-09-29T12:25:43.999Z'
      },
      {
        type: 'QuestionRendered',
        clientTimestamp: '2020-09-29T12:25:46.864Z',
        data: {
          sequenceNumber: 1,
          question: '2x5'
        }
      },
      {
        type: 'QuestionTimerStarted',
        clientTimestamp: '2020-09-29T12:25:46.864Z',
        data: {
          sequenceNumber: 1,
          question: '2x5'
        }
      },
      {
        type: 'QuestionTimerCancelled',
        clientTimestamp: '2020-09-29T12:25:48.287Z',
        data: {
          sequenceNumber: 1,
          question: '2x5'
        }
      },
      {
        type: 'QuestionAnswered',
        clientTimestamp: '2020-09-29T12:25:48.287Z',
        data: {
          sequenceNumber: 1,
          question: '2x5'
        }
      },
      {
        type: 'PauseRendered',
        clientTimestamp: '2020-09-29T12:25:48.290Z',
        data: {
          sequenceNumber: 2,
          question: '11x2'
        }
      },
      {
        type: 'QuestionTimerStarted',
        clientTimestamp: '2020-09-29T12:25:51.299Z',
        data: {
          sequenceNumber: 2,
          question: '11x2'
        }
      },
      {
        type: 'QuestionRendered',
        clientTimestamp: '2020-09-29T12:25:51.299Z',
        data: {
          sequenceNumber: 2,
          question: '11x2'
        }
      },
      {
        type: 'QuestionTimerCancelled',
        clientTimestamp: '2020-09-29T12:25:52.541Z',
        data: {
          sequenceNumber: 2,
          question: '11x2'
        }
      },
      {
        type: 'QuestionAnswered',
        clientTimestamp: '2020-09-29T12:25:52.541Z',
        data: {
          sequenceNumber: 2,
          question: '11x2'
        }
      },
      {
        type: 'PauseRendered',
        clientTimestamp: '2020-09-29T12:25:52.544Z',
        data: {
          sequenceNumber: 3,
          question: '5x10'
        }
      },
      {
        type: 'QuestionTimerStarted',
        clientTimestamp: '2020-09-29T12:25:55.551Z',
        data: {
          sequenceNumber: 3,
          question: '5x10'
        }
      },
      {
        type: 'QuestionRendered',
        clientTimestamp: '2020-09-29T12:25:55.551Z',
        data: {
          sequenceNumber: 3,
          question: '5x10'
        }
      },
      {
        type: 'QuestionAnswered',
        clientTimestamp: '2020-09-29T12:25:57.057Z',
        data: {
          sequenceNumber: 3,
          question: '5x10'
        }
      },
      {
        type: 'QuestionTimerCancelled',
        clientTimestamp: '2020-09-29T12:25:57.057Z',
        data: {
          sequenceNumber: 3,
          question: '5x10'
        }
      },
      {
        type: 'PauseRendered',
        clientTimestamp: '2020-09-29T12:25:57.060Z',
        data: {
          sequenceNumber: 4,
          question: '4x4'
        }
      },
      {
        type: 'QuestionRendered',
        clientTimestamp: '2020-09-29T12:26:00.069Z',
        data: {
          sequenceNumber: 4,
          question: '4x4'
        }
      },
      {
        type: 'QuestionTimerStarted',
        clientTimestamp: '2020-09-29T12:26:00.069Z',
        data: {
          sequenceNumber: 4,
          question: '4x4'
        }
      },
      {
        type: 'QuestionAnswered',
        clientTimestamp: '2020-09-29T12:26:01.940Z',
        data: {
          sequenceNumber: 4,
          question: '4x4'
        }
      },
      {
        type: 'QuestionTimerCancelled',
        clientTimestamp: '2020-09-29T12:26:01.940Z',
        data: {
          sequenceNumber: 4,
          question: '4x4'
        }
      },
      {
        type: 'PauseRendered',
        clientTimestamp: '2020-09-29T12:26:01.943Z',
        data: {
          sequenceNumber: 5,
          question: '3x9'
        }
      },
      {
        type: 'QuestionRendered',
        clientTimestamp: '2020-09-29T12:26:04.952Z',
        data: {
          sequenceNumber: 5,
          question: '3x9'
        }
      },
      {
        type: 'QuestionTimerStarted',
        clientTimestamp: '2020-09-29T12:26:04.953Z',
        data: {
          sequenceNumber: 5,
          question: '3x9'
        }
      },
      {
        type: 'QuestionTimerCancelled',
        clientTimestamp: '2020-09-29T12:26:06.944Z',
        data: {
          sequenceNumber: 5,
          question: '3x9'
        }
      },
      {
        type: 'QuestionAnswered',
        clientTimestamp: '2020-09-29T12:26:06.944Z',
        data: {
          sequenceNumber: 5,
          question: '3x9'
        }
      },
      {
        type: 'PauseRendered',
        clientTimestamp: '2020-09-29T12:26:06.948Z',
        data: {
          sequenceNumber: 6,
          question: '2x4'
        }
      },
      {
        type: 'QuestionTimerStarted',
        clientTimestamp: '2020-09-29T12:26:09.956Z',
        data: {
          sequenceNumber: 6,
          question: '2x4'
        }
      },
      {
        type: 'QuestionRendered',
        clientTimestamp: '2020-09-29T12:26:09.956Z',
        data: {
          sequenceNumber: 6,
          question: '2x4'
        }
      },
      {
        type: 'QuestionTimerCancelled',
        clientTimestamp: '2020-09-29T12:26:11.074Z',
        data: {
          sequenceNumber: 6,
          question: '2x4'
        }
      },
      {
        type: 'QuestionAnswered',
        clientTimestamp: '2020-09-29T12:26:11.074Z',
        data: {
          sequenceNumber: 6,
          question: '2x4'
        }
      },
      {
        type: 'PauseRendered',
        clientTimestamp: '2020-09-29T12:26:11.077Z',
        data: {
          sequenceNumber: 7,
          question: '3x3'
        }
      },
      {
        type: 'QuestionRendered',
        clientTimestamp: '2020-09-29T12:26:14.085Z',
        data: {
          sequenceNumber: 7,
          question: '3x3'
        }
      },
      {
        type: 'QuestionTimerStarted',
        clientTimestamp: '2020-09-29T12:26:14.085Z',
        data: {
          sequenceNumber: 7,
          question: '3x3'
        }
      },
      {
        type: 'QuestionAnswered',
        clientTimestamp: '2020-09-29T12:26:15.310Z',
        data: {
          sequenceNumber: 7,
          question: '3x3'
        }
      },
      {
        type: 'QuestionTimerCancelled',
        clientTimestamp: '2020-09-29T12:26:15.310Z',
        data: {
          sequenceNumber: 7,
          question: '3x3'
        }
      },
      {
        type: 'PauseRendered',
        clientTimestamp: '2020-09-29T12:26:15.313Z',
        data: {
          sequenceNumber: 8,
          question: '4x9'
        }
      },
      {
        type: 'QuestionTimerStarted',
        clientTimestamp: '2020-09-29T12:26:18.320Z',
        data: {
          sequenceNumber: 8,
          question: '4x9'
        }
      },
      {
        type: 'QuestionRendered',
        clientTimestamp: '2020-09-29T12:26:18.320Z',
        data: {
          sequenceNumber: 8,
          question: '4x9'
        }
      },
      {
        type: 'QuestionTimerCancelled',
        clientTimestamp: '2020-09-29T12:26:23.272Z',
        data: {
          sequenceNumber: 8,
          question: '4x9'
        }
      },
      {
        type: 'QuestionAnswered',
        clientTimestamp: '2020-09-29T12:26:23.272Z',
        data: {
          sequenceNumber: 8,
          question: '4x9'
        }
      },
      {
        type: 'PauseRendered',
        clientTimestamp: '2020-09-29T12:26:23.275Z',
        data: {
          sequenceNumber: 9,
          question: '6x5'
        }
      },
      {
        type: 'QuestionRendered',
        clientTimestamp: '2020-09-29T12:26:26.284Z',
        data: {
          sequenceNumber: 9,
          question: '6x5'
        }
      },
      {
        type: 'QuestionTimerStarted',
        clientTimestamp: '2020-09-29T12:26:26.284Z',
        data: {
          sequenceNumber: 9,
          question: '6x5'
        }
      },
      {
        type: 'QuestionTimerCancelled',
        clientTimestamp: '2020-09-29T12:26:27.819Z',
        data: {
          sequenceNumber: 9,
          question: '6x5'
        }
      },
      {
        type: 'QuestionAnswered',
        clientTimestamp: '2020-09-29T12:26:27.819Z',
        data: {
          sequenceNumber: 9,
          question: '6x5'
        }
      },
      {
        type: 'PauseRendered',
        clientTimestamp: '2020-09-29T12:26:27.822Z',
        data: {
          sequenceNumber: 10,
          question: '12x12'
        }
      },
      {
        type: 'QuestionRendered',
        clientTimestamp: '2020-09-29T12:26:30.827Z',
        data: {
          sequenceNumber: 10,
          question: '12x12'
        }
      },
      {
        type: 'QuestionTimerStarted',
        clientTimestamp: '2020-09-29T12:26:30.827Z',
        data: {
          sequenceNumber: 10,
          question: '12x12'
        }
      },
      {
        type: 'QuestionAnswered',
        clientTimestamp: '2020-09-29T12:26:31.796Z',
        data: {
          sequenceNumber: 10,
          question: '12x12'
        }
      },
      {
        type: 'QuestionTimerCancelled',
        clientTimestamp: '2020-09-29T12:26:31.796Z',
        data: {
          sequenceNumber: 10,
          question: '12x12'
        }
      },
      {
        type: 'CheckSubmissionPending',
        clientTimestamp: '2020-09-29T12:26:31.797Z'
      },
      {
        type: 'CheckSubmissionApiCalled',
        clientTimestamp: '2020-09-29T12:26:31.801Z'
      }
    ],
    inputs: [
      {
        input: '1',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:25:47.963Z',
        question: '2x5',
        sequenceNumber: 1
      },
      {
        input: '0',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:25:48.052Z',
        question: '2x5',
        sequenceNumber: 1
      },
      {
        input: 'Enter',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:25:48.287Z',
        question: '2x5',
        sequenceNumber: 1
      },
      {
        input: '2',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:25:52.278Z',
        question: '11x2',
        sequenceNumber: 2
      },
      {
        input: '2',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:25:52.369Z',
        question: '11x2',
        sequenceNumber: 2
      },
      {
        input: 'Enter',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:25:52.541Z',
        question: '11x2',
        sequenceNumber: 2
      },
      {
        input: '5',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:25:56.681Z',
        question: '5x10',
        sequenceNumber: 3
      },
      {
        input: '0',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:25:56.854Z',
        question: '5x10',
        sequenceNumber: 3
      },
      {
        input: 'Enter',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:25:57.056Z',
        question: '5x10',
        sequenceNumber: 3
      },
      {
        input: '1',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:01.574Z',
        question: '4x4',
        sequenceNumber: 4
      },
      {
        input: '6',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:01.678Z',
        question: '4x4',
        sequenceNumber: 4
      },
      {
        input: 'Enter',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:01.940Z',
        question: '4x4',
        sequenceNumber: 4
      },
      {
        input: '2',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:06.103Z',
        question: '3x9',
        sequenceNumber: 5
      },
      {
        input: '7',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:06.614Z',
        question: '3x9',
        sequenceNumber: 5
      },
      {
        input: 'Enter',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:06.944Z',
        question: '3x9',
        sequenceNumber: 5
      },
      {
        input: '8',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:10.852Z',
        question: '2x4',
        sequenceNumber: 6
      },
      {
        input: 'Enter',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:11.074Z',
        question: '2x4',
        sequenceNumber: 6
      },
      {
        input: '9',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:14.834Z',
        question: '3x3',
        sequenceNumber: 7
      },
      {
        input: '9',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:15.016Z',
        question: '3x3',
        sequenceNumber: 7
      },
      {
        input: 'Enter',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:15.310Z',
        question: '3x3',
        sequenceNumber: 7
      },
      {
        input: '3',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:19.420Z',
        question: '4x9',
        sequenceNumber: 8
      },
      {
        input: '6',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:19.896Z',
        question: '4x9',
        sequenceNumber: 8
      },
      {
        input: 'Backspace',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:20.522Z',
        question: '4x9',
        sequenceNumber: 8
      },
      {
        input: '6',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:21.881Z',
        question: '4x9',
        sequenceNumber: 8
      },
      {
        input: '6',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:22.353Z',
        question: '4x9',
        sequenceNumber: 8
      },
      {
        input: 'Backspace',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:22.510Z',
        question: '4x9',
        sequenceNumber: 8
      },
      {
        input: 'Enter',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:23.272Z',
        question: '4x9',
        sequenceNumber: 8
      },
      {
        input: '3',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:27.414Z',
        question: '6x5',
        sequenceNumber: 9
      },
      {
        input: '0',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:27.591Z',
        question: '6x5',
        sequenceNumber: 9
      },
      {
        input: 'Enter',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:27.819Z',
        question: '6x5',
        sequenceNumber: 9
      },
      {
        input: '1',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:31.370Z',
        question: '12x12',
        sequenceNumber: 10
      },
      {
        input: '4',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:31.455Z',
        question: '12x12',
        sequenceNumber: 10
      },
      {
        input: '4',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:31.604Z',
        question: '12x12',
        sequenceNumber: 10
      },
      {
        input: 'Enter',
        eventType: 'keydown',
        clientTimestamp: '2020-09-29T12:26:31.796Z',
        question: '12x12',
        sequenceNumber: 10
      }
    ],
    answers: [
      {
        factor1: 2,
        factor2: 5,
        answer: '10',
        sequenceNumber: 1,
        question: '2x5',
        clientTimestamp: '2020-09-29T12:25:48.287Z'
      },
      {
        factor1: 11,
        factor2: 2,
        answer: '22',
        sequenceNumber: 2,
        question: '11x2',
        clientTimestamp: '2020-09-29T12:25:52.541Z'
      },
      {
        factor1: 5,
        factor2: 10,
        answer: '50',
        sequenceNumber: 3,
        question: '5x10',
        clientTimestamp: '2020-09-29T12:25:57.057Z'
      },
      {
        factor1: 4,
        factor2: 4,
        answer: '16',
        sequenceNumber: 4,
        question: '4x4',
        clientTimestamp: '2020-09-29T12:26:01.940Z'
      },
      {
        factor1: 3,
        factor2: 9,
        answer: '27',
        sequenceNumber: 5,
        question: '3x9',
        clientTimestamp: '2020-09-29T12:26:06.944Z'
      },
      {
        factor1: 2,
        factor2: 4,
        answer: '8',
        sequenceNumber: 6,
        question: '2x4',
        clientTimestamp: '2020-09-29T12:26:11.074Z'
      },
      {
        factor1: 3,
        factor2: 3,
        answer: '99',
        sequenceNumber: 7,
        question: '3x3',
        clientTimestamp: '2020-09-29T12:26:15.310Z'
      },
      {
        factor1: 4,
        factor2: 9,
        answer: '36',
        sequenceNumber: 8,
        question: '4x9',
        clientTimestamp: '2020-09-29T12:26:23.272Z'
      },
      {
        factor1: 6,
        factor2: 5,
        answer: '30',
        sequenceNumber: 9,
        question: '6x5',
        clientTimestamp: '2020-09-29T12:26:27.819Z'
      },
      {
        factor1: 12,
        factor2: 12,
        answer: '144',
        sequenceNumber: 10,
        question: '12x12',
        clientTimestamp: '2020-09-29T12:26:31.796Z'
      }
    ]
  },
  markedCheck: {
    mark: 9,
    checkCode: 'b12fb2d0-f259-4684-91d2-c73d01f7d458',
    maxMarks: 10,
    markedAnswers: [
      {
        factor1: 2,
        factor2: 5,
        answer: '10',
        sequenceNumber: 1,
        question: '2x5',
        clientTimestamp: '2020-09-29T12:25:48.287Z',
        isCorrect: true
      },
      {
        factor1: 11,
        factor2: 2,
        answer: '22',
        sequenceNumber: 2,
        question: '11x2',
        clientTimestamp: '2020-09-29T12:25:52.541Z',
        isCorrect: true
      },
      {
        factor1: 5,
        factor2: 10,
        answer: '50',
        sequenceNumber: 3,
        question: '5x10',
        clientTimestamp: '2020-09-29T12:25:57.057Z',
        isCorrect: true
      },
      {
        factor1: 4,
        factor2: 4,
        answer: '16',
        sequenceNumber: 4,
        question: '4x4',
        clientTimestamp: '2020-09-29T12:26:01.940Z',
        isCorrect: true
      },
      {
        factor1: 3,
        factor2: 9,
        answer: '27',
        sequenceNumber: 5,
        question: '3x9',
        clientTimestamp: '2020-09-29T12:26:06.944Z',
        isCorrect: true
      },
      {
        factor1: 2,
        factor2: 4,
        answer: '8',
        sequenceNumber: 6,
        question: '2x4',
        clientTimestamp: '2020-09-29T12:26:11.074Z',
        isCorrect: true
      },
      {
        factor1: 3,
        factor2: 3,
        answer: '99',
        sequenceNumber: 7,
        question: '3x3',
        clientTimestamp: '2020-09-29T12:26:15.310Z',
        isCorrect: false
      },
      {
        factor1: 4,
        factor2: 9,
        answer: '36',
        sequenceNumber: 8,
        question: '4x9',
        clientTimestamp: '2020-09-29T12:26:23.272Z',
        isCorrect: true
      },
      {
        factor1: 6,
        factor2: 5,
        answer: '30',
        sequenceNumber: 9,
        question: '6x5',
        clientTimestamp: '2020-09-29T12:26:27.819Z',
        isCorrect: true
      },
      {
        factor1: 12,
        factor2: 12,
        answer: '144',
        sequenceNumber: 10,
        question: '12x12',
        clientTimestamp: '2020-09-29T12:26:31.796Z',
        isCorrect: true
      }
    ],
    markedAt: '2020-09-29T12:26:34.356Z'
  }
}
