const appInsights = require('applicationinsights')
const featureToggles = require('feature-toggles')
const config = require('../config')

const monitor = (type, obj) => {
  if (!featureToggles.isFeatureEnabled('dependencyTracking') || !config.Logging.ApplicationInsights.Key) {
    return obj
  }

  return new Proxy(obj, {
    get (target, propKey) {
      const initialProp = target[propKey]
      if (typeof initialProp !== 'function') {
        return initialProp
      }
      if (initialProp.constructor.name === 'AsyncFunction') {
        return (...args) => {
          const startTime = Date.now()
          return initialProp(...args).then(result => {
            const duration = Date.now() - startTime
            appInsights.defaultClient.trackDependency({ dependencyTypeName: type, name: propKey, duration: duration })
            return result
          })
        }
      }
      return (...args) => {
        const startTime = Date.now()
        const result = initialProp(...args)
        const duration = Date.now() - startTime
        appInsights.defaultClient.trackDependency({ dependencyTypeName: type, name: propKey, duration: duration })
        return result
      }
    }
  })
}

module.exports = monitor
