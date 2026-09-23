'use strict'

// jest's node test environment VM context does not always expose the WebCrypto global
// that @azure/* packages rely on (via @typespec/ts-http-runtime) for randomUUID()
if (!globalThis.crypto) {
  globalThis.crypto = require('node:crypto').webcrypto
}
