/**
 * Copy SASS files from /node_module/govuk_frontend-toolkit to /vendor.
 * Remove inline comments as not supported by current configuration.
 */

const fse = require('fs-extra')
const replaceContent = require('replace-in-file')
const folders = ['images', 'stylesheets', 'javascripts']

for (let folder of folders) {
  let origin = `${__dirname}/node_modules/govuk_frontend_toolkit/${folder}`
  let destination = `${__dirname}/src/vendor/govuk_frontend_toolkit/${folder}`
  /**
   * Copy files over.
   */
  try {
    if (fse.existsSync(origin)) {
      fse.copySync(origin, destination, {overwrite: true, errorOnExist: true})
      console.log(`govuk_frontend-toolkit/${folder} has been copied over to vendor/govuk_frontend-toolkit/${folder}`)
    } else {
      console.log(`Failed to copy govuk_frontend-toolkit/${folder}`)
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
}
