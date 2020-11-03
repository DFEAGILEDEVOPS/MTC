#!/usr/bin/env node
'use strict'
const readline = require('readline')
const crypto = require('crypto')
const hash = crypto.createHash('sha256')

/**
 * Why?
 * ----
 *
 * I wanted to verify SHA2-256 sum stored in SQL server for the userAgent.
 *
 * SQL Server can produce SHA2-256 message digests.  If the string you want to sum is varchar() then you get the
 * ASCII sha2-256 sum, but if the string is nvarchar() you get the UNICODE sha2-256 sum.  These are different values.
 *
 * The ascii version can be easily compared using standard tools: macOS has shasum -a 256 and Linux has GNU's sha256sum
 * and both these tools produce output similar to the varchar method.  To produce output similar to the nvarchar method
 * we need to read the input string in UTF-16.
 *
 * ASCII OUTPUT (HEX)
 * -------------------
 * select convert(varchar(128), hashbytes('SHA2_256', convert(varchar(128), '123')), 2);
 * A665A45920422F9D417E4867EFDC4FB8A04A1F3FFF1FA07E998E86F7F7A27AE3
 *
 * printf '123' | shasum -a 256 | tr a-z A-Z
 * A665A45920422F9D417E4867EFDC4FB8A04A1F3FFF1FA07E998E86F7F7A27AE3
 *
 * UNICODE OUTPUT (HEX)
 * --------------------
 * select convert(varchar(128), hashbytes('SHA2_256', convert(nvarchar(128), '123')), 2);
 * 26D6A8AD97C75FFC548F6873E5E93CE475479E3E1A1097381E54221FB53EC1D2
 *
 * echo -n '123' |./index.js | tr a-z A-Z
 * 26D6A8AD97C75FFC548F6873E5E93CE475479E3E1A1097381E54221FB53EC1D2
 *
 */

function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  hash.on('readable', () => {
    // Only one element is going to be produced by the
    // hash stream.
    const data = hash.read()
    if (data) {
      console.log(data.toString('hex'));
      // Prints:
      //   6a2da20943931e9834fc12cfe5bb47bbd9ae43489a30726962b576f4e3993e50
    }
  })

  rl.on('line', function(line) {
    const buf = Buffer.from(line, 'utf16le')
    hash.write(buf)
    hash.end()
  })
}

main()
