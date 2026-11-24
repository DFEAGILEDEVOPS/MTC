'use strict'

// Jest 27 does not expose the Web Crypto global used by uuid and Azure SDKs.
if (!globalThis.crypto) {
  globalThis.crypto = require('node:crypto').webcrypto
}
