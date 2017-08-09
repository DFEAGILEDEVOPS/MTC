/**
 * Remove inline comments.
 * File clean-up.
 */
const replaceContent = require('replace-in-file')

const fileCleanup = (destination) => {
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

module.exports = fileCleanup
