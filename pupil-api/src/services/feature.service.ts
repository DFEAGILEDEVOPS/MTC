import logger from './log.service'
import config from '../config'

let initialised: boolean = false

export class FeatureService {
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
