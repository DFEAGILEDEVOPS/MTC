/**
 * Copy SASS files from /node_module/govuk_frontend-toolkit to /assets.
 * Remove inline comments as not supported by current configuration.
 */
const fse = require(`${__dirname}/../node_modules/fs-extra`)

const copyToolkit = () => {
  const fileCleanup = require(`${__dirname}/helpers`)
  const folders = ['stylesheets', 'javascripts']

  for (let folder of folders) {
    let origin = `${__dirname}/../node_modules/govuk_frontend_toolkit/${folder}`
    let destination = `${__dirname}/../src/assets/govuk_frontend_toolkit/${folder}`
    /**
     * Copy files over.
     */
    try {
      if (fse.existsSync(origin)) {
        fse.copySync(origin, destination, {overwrite: true, errorOnExist: true})
        fileCleanup(destination)
        console.log(`govuk_frontend-toolkit/${folder} has been copied over to assets/govuk_frontend-toolkit/${folder}`)
      } else {
        console.log(`Failed to copy govuk_frontend_toolkit/${folder}`)
      }
    } catch (err) {
      console.log(err)
    }
  }
}

/**
 * Copy files over.
 */
const copyToolkitImages = () => {
  const imgOrigin = `${__dirname}/../node_modules/govuk_frontend_toolkit/images`
  const imgDest = `${__dirname}/../src/assets/govuk_frontend_toolkit/images`

  try {
    if (fse.existsSync(imgOrigin)) {
      fse.copySync(imgOrigin, imgDest, {overwrite: true, errorOnExist: true})
      console.log(`${imgOrigin} has been copied over to ${imgDest}`)
    } else {
      console.log(`Failed to copy govuk_frontend_toolkit/images`)
    }
  } catch (err) {
    console.log(err)
  }
}

copyToolkit()
copyToolkitImages()
