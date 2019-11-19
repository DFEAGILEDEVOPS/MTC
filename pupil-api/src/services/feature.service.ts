import logger from './log.service'
import config from '../config'
import * as R from 'ramda'
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
    const environmentName = config.Environment
    let featureTogglesSpecific = ''
    let featureTogglesDefault = ''
    let featureTogglesSpecificPath = ''
    let featureTogglesDefaultPath = ''
    try {
      featureTogglesSpecificPath = '../feature-toggles/feature-toggles.' + environmentName
      featureTogglesSpecific = environmentName ? require(featureTogglesSpecificPath) : null
    // tslint:disable-next-line: no-empty
    } catch (ignore) {} // missing feature files throw intentionally

    try {
      featureTogglesDefaultPath = '../feature-toggles/feature-toggles.default'
      featureTogglesDefault = require(featureTogglesDefaultPath)
    // tslint:disable-next-line: no-empty
    } catch (ignore) {} // missing feature files throw intentionally

    const featureTogglesMerged = R.mergeRight(featureTogglesDefault, featureTogglesSpecific)

    if (featureTogglesMerged) {
      logger.info(`Loading merged feature toggles from '${featureTogglesSpecificPath}', '${featureTogglesDefaultPath}': `, featureTogglesMerged)
      featureToggles.load(featureTogglesMerged)
    }
    initialised = true
  }
}
