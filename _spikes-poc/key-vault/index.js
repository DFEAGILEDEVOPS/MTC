'use strict'

const keyVaultService = require('./key-vault.service')

;(async function main() {
  // retrieve from the vault
  try {
    const item = await keyVaultService.get('guys-secret')
    console.log('secret is ', item)
  } catch (error) {
    console.warn('Error', error)
  }
})()
