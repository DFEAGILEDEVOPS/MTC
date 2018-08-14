'use strict'

import 'dotenv/config'
import * as toBool from 'to-bool'

const getEnvironment = () => {
  return process.env.ENVIRONMENT_NAME || 'Local-Dev'
}

export = {
  PORT: process.env.PORT || '3003',
  // autoMark true | false - Automatically mark the check data when we receive it: boolean
  autoMark: process.env.hasOwnProperty('AUTO_MARK') ? toBool(process.env.AUTO_MARK) : true,
  Logging: {
    Express: {
      UseWinston: process.env.EXPRESS_LOGGING_WINSTON || false
    }
  },
  Environment: getEnvironment(),
  Endpoints: {
    Auth: process.env.API_AUTH || false
  }
}
