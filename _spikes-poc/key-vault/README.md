# Azure Key Vault Spike

## Aim

To see if we can use Azure Key Vault (KV) in our workflow.

## Local Development

It appears that using KV from node on local dev only offers three ways to log in:

1) using an interactive login using the browser, device code, etc which would severely impede developer flow
2) using a service principle (which we can't create)
3) using a file generated from a service principle

KeyVault would be accessed in the Azure web app using MSI which was not tested as it appears that the lack of useful
options for developers operating from their own machines in a node environment is very limited.

As our azure accounts have 2FA enabled we can only use interactive-login which is not suitable for non-interactive
authorisation.

An issue has already been raised for this in 2017
https://github.com/Azure/azure-sdk-for-node/issues/2284

If issue 2284 was addressed developers could log in once using az CLI and the local webapp could use az CLI to get
credentials.

## Azure Webapps

Not tested.


