# Azure Storage Queue Library

The Azure Storage Queue Library is a Node JS library that must be bundled by webpack in order for it to be suitable for a browser.

The steps for bundling the MS Azure libraries are [detailed here](https://github.com/Azure/azure-sdk-for-js/blob/main/documentation/Bundling.md)

## Prerequisites

Install webpack on your machine `npm install -g webpack webpack-cli`

## Usage

Under the `src` folder is an `index.js` file where we define our service that encapsulates the required functionality for the Angular browser app.

Once changes are complete, run `yarn build` and webpack will output the bundled 'browser friendly' javascript into the `dist` folder.

In order to reference this from the angular app, copy the bundle file into the `ref` folder, maintaining its name.
