'use strict;'

const config = {
  latency: {
    isOn: false,
    minDelayMs: 250,
    maxDelayMs: 35000
  },
  proxy: {
    destinationServer: 'localhost',
    destinationPort: 3003,
  },
  chaos: {
    chaosPercentage: 50,
    responses: [
      { status: 408, msg: 'Request timeout' },
      { status: 429, msg: 'Too many requests' },
      { status: 500, msg: 'Server error' },
      { status: 502, msg: 'Bad gateway' },
      { status: 503, msg: 'Service Unavailable' },
      { status: 504, msg: 'Gateway timeout' }
    ]
  }
}

module.exports = config
