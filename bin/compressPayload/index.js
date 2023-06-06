const LZString = require('lz-string')
const fs = require('fs')
const process = require('process')
const path = require('path')

/**
 * Processing
 *
 * The payload is stored in Azure table-storage.  Here is the method that worked for me.  NOTE THAT
 * IT COMPRESSES TO BASE64!.  If you plan on using this tool, you will need to modify any decompression
 * libraries to also switch from UTF16 (nightmare) to Base64 encoded character sets.
 *
 * 1. Edit the JSON payload as required.
 * 2. Run this tool on it to create a BASE64 compressed version:
 *    `node index.js payload.json` will create `payload.compressed.txt`
 * 3. You can now copy and paste to edit the row in Azure Table Storage, being careful to overwrite
 *    the previous archive value.
 * 4. Save the update
 * 5. Re-run sync-results via API to re-process the payload (if required).
 *
 */


if (process.argv.length < 3) {
  console.error('Usage: node index.js <input_file>')
  process.exit(1)
}

const parsedPath = path.parse(process.argv[2])
const outputFile = path.join(
  parsedPath.dir,
  parsedPath.name + '.compressed.txt'
)
console.log(`Writing compressed data to: ${outputFile}`)

const input = fs.readFileSync(process.argv[2], { encoding: 'utf8' }) // json file
const compressedString = LZString.compressToBase64(input)
fs.writeFileSync(outputFile, compressedString, { encoding: 'utf8'}) // output file
