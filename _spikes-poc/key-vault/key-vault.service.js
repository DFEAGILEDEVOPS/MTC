'use strict'

const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '..', '.env')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}
const msRestAzure = require('ms-rest-azure')
const AzureKeyVault = require('azure-keyvault')

const keyVaultService = {
  authenticate: async function authenticate () {
    // on azure - not tested
    // return msRestAzure.loginWithAppServiceMSI({ resource:  'https://vault.azure.net' });

    // can't use with our accounts which require 2FA
    // return msRestAzure.loginWithServicePrincipalSecret(process.env.AZURE_CLIENT_ID, process.env.AZURE_CLIENT_SECRET, process.env.AZURE_TENANT_ID)

    // Does work on local dev - but we need a non-interactive login
    return msRestAzure.interactiveLogin()
  },

  get: async function get (secretName) {
    try {
      const credentials = await this.authenticate()
      const keyVaultClient = new AzureKeyVault.KeyVaultClient(credentials);
      const secret = await keyVaultClient.getSecret(process.env.KEY_VAULT_URI, secretName, "")
      return secret.value
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = keyVaultService
