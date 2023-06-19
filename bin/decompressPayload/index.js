const LZString = require('lz-string')
const fs = require('fs')

/**
 * Processing
 *
 * The payload is stored in Azure table-storage.  Here is the method that worked for me.
 *
 * 1. Download the table row using Azure Storage Explorer's Export function.  The saves
 *    the data as a csv file.
 * 2. Open the csv using Numbers and select the archive cell.  Select all.
 * 3. Paste the data into BBEdit with the character encoding set to "UTF-16 little endian, No BOM"
 * 4. Save the file
 * 5. Run this tool against the input file
 *
 */


if (process.argv.length < 3) {
  console.error('Usage: node index.js <input_file>')
  process.exit(1)
}

const archive = fs.readFileSync(process.argv[2], { encoding: 'utf16le' })
console.log(LZString.decompressFromUTF16(archive))

