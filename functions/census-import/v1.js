'use strict'

const v1 = {
  process: async function (context, blob) {
    await this.handleCensusImport(context, blob)
  },

  handleCensusImport: async function (context, blob) {
    console.log('blob received', blob)
  }
}

module.exports = v1
