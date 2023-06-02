const LZString = require('lz-string')
const fs = require('fs')

/**
 * Processing
 *
 * The payload is stored in Azure table-storage.  Here is the method that worked for me.
 *
 * 1. Create the compressed payload file using this tool:
 *    node index.js payload.json > payload.compressed.txt
 * 2. Open data in BBEdit using char-encoding UTF-16 little endian, No BOM.
 *    Select all.
 * 3. Edit the row in Azure Table Storage, being careful to overwrite the previous archive value.
 * 4. Save the update
 * 5. Re-run sync-results via API to re-process the payload.
 *
 */


if (process.argv.length < 3) {
  console.error('Usage: node index.js <input_file>')
  process.exit(1)
}

const archive = fs.readFileSync(process.argv[2], { encoding: 'utf16le' })
console.log(LZString.compressToUTF16(archive))
