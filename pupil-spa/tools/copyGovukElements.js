/**
 * Copy SASS files from /node_module/govuk_elements_sass to /assets.
 * Remove inline comments as not supported by current configuration.
 */
const fse = require(`${__dirname}/../node_modules/fs-extra`)

const copyElements = () => {
  const fileCleanup = require(`${__dirname}/helpers`)
  let origin = `${__dirname}/../node_modules/govuk-elements-sass/public/sass`
  let destination = `${__dirname}/../src/assets/govuk-elements-sass`

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

  try {
    fileCleanup(destination)
  } catch (err) {
    console.log(err)
  }
}

copyElements()
