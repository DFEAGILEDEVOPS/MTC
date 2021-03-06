import logger from './log.service'
import config from '../config'
import * as featureToggles from 'feature-toggles'

export interface IFeatureService {
}

let initialised: boolean = false

export class FeatureService implements IFeatureService {

  constructor () {
    if (!initialised) this.init()
  }

  private init (): void {
    /**
     * Load feature toggles
     */
    logger.info('ENVIRONMENT_NAME : ' + config.Environment)
    logger.info('Loading feature toggles from: ' + JSON.stringify(config.FeatureToggles))
    initialised = true
  }
}
