/**
 * Copy SASS files from /node_module/govuk_frontend-toolkit to /vendor
 */

const fse = require('fs-extra')
const folders = ['images', 'stylesheets', 'javascripts']

for (let folder of folders) {
  try {
    let origin = `${__dirname}/node_modules/govuk_frontend_toolkit/${folder}`
    let destination = `${__dirname}/src/vendor/govuk_frontend_toolkit/${folder}`
    if (fse.existsSync(origin)) {
      fse.copySync(origin, destination, {overwrite: true, errorOnExist: true})
      console.log(`govuk_frontend-toolkit/${folder} has been copied over to vendor/govuk_frontend-toolkit/${folder}`)
    } else {
      console.log(`Failed to copy govuk_frontend-toolkit/${folder}`)
    }
  } catch (err) {
    console.log(err)
  }
}
