/**
 * Copy SASS files from /node_module/govuk_elements_sass to /vendor.
 * Remove inline comments as not supported by current configuration.
 */

const fse = require('fs-extra')
const replaceContent = require('replace-in-file')

let origin = `${__dirname}/node_modules/govuk-elements-sass/public/sass`
let destination = `${__dirname}/src/vendor/govuk-elements-sass`
/**
 * Copy files over.
 */
try {
  if (fse.existsSync(origin)) {
    fse.copySync(origin, destination, {overwrite: true, errorOnExist: true})
    console.log(`${origin} has been copied over to ${destination}`)
  } else {
    console.log(`Failed to copy ${origin}`)
  }
} catch (err) {
  console.log(err)
}

/**
 * Remove inline comments
 */
const replaceOptions = {
  files: [
    `${destination}/*.scss`,
    `${destination}/**/*.scss`
  ],
  from: /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm,
  to: '$1',
  allowEmptyPaths: false,
  encoding: 'utf8'
}
try {
  replaceContent.sync(replaceOptions)
  console.log('Inline comments removed')
} catch (err) {
  console.log(err)
}
