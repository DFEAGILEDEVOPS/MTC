import logger from './log.service'
import config from '../config'
import * as featureToggles from 'feature-toggles'

export interface IFeatureService {
  redisAuthMode (): boolean
}

let initialised: boolean

export class FeatureService implements IFeatureService {

  constructor () {
    if (!initialised) this.init()
  }

  redisAuthMode (): boolean {
    return featureToggles.isFeatureEnabled('preparedChecksInRedis')
  }

  private init (): void {
    /**
     * Load feature toggles
     */
    logger.info('ENVIRONMENT_NAME : ' + config.Environment)
    featureToggles.load(config.FeatureToggles)
    initialised = true
  }
}
