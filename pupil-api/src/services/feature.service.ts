import logger from './log.service'
import config from '../config'
import * as featureToggles from 'feature-toggles'

export interface IFeatureService {
  _2020Mode (): boolean
}

let initialised: boolean

export class FeatureService implements IFeatureService {

  constructor () {
    if (!initialised) this.init()
  }

  _2020Mode (): boolean {
    return featureToggles.isFeatureEnabled('_2020Mode')
  }

  private init (): void {
    /**
     * Load feature toggles
     */
    logger.info('ENVIRONMENT_NAME : ' + config.Environment)
    featureToggles.load(config.FeatureToggles)
    logger.info('Loading feature toggles from: ', config.FeatureToggles)
    initialised = true
  }
}
