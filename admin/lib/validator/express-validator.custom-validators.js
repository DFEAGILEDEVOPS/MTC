'use strict'

const remainderLookup = {
  0: 'A',
  1: 'B',
  2: 'C',
  3: 'D',
  4: 'E',
  5: 'F',
  6: 'G',
  7: 'H',
  8: 'J',
  9: 'K',
  10: 'L',
  11: 'M',
  12: 'N',
  13: 'P',
  14: 'Q',
  15: 'R',
  16: 'T',
  17: 'U',
  18: 'V',
  19: 'W',
  20: 'X',
  21: 'Y',
  22: 'Z'
}

// We want these LA codes to be unique
const validLaCodes = new Set([
  '001',
  '002',
  '003',
  '004',
  '005',
  '201',
  '202',
  '203',
  '204',
  '205',
  '206',
  '207',
  '208',
  '209',
  '210',
  '211',
  '212',
  '213',
  '301',
  '302',
  '303',
  '304',
  '305',
  '306',
  '307',
  '308',
  '309',
  '310',
  '311',
  '312',
  '313',
  '314',
  '315',
  '316',
  '317',
  '318',
  '319',
  '320',
  '330',
  '331',
  '332',
  '333',
  '334',
  '335',
  '336',
  '340',
  '341',
  '342',
  '343',
  '344',
  '350',
  '351',
  '352',
  '353',
  '354',
  '355',
  '356',
  '357',
  '358',
  '359',
  '370',
  '371',
  '372',
  '373',
  '380',
  '381',
  '382',
  '383',
  '384',
  '390',
  '391',
  '392',
  '393',
  '394',
  '420',
  '660',
  '661',
  '662',
  '663',
  '664',
  '665',
  '666',
  '667',
  '668',
  '669',
  '670',
  '671',
  '672',
  '673',
  '674',
  '675',
  '676',
  '677',
  '678',
  '679',
  '680',
  '681',
  '701',
  '702',
  '703',
  '704',
  '705',
  '706',
  '707',
  '708',
  '800',
  '801',
  '802',
  '803',
  '805',
  '806',
  '807',
  '808',
  '810',
  '811',
  '812',
  '813',
  '815',
  '816',
  '820',
  '821',
  '822',
  '823',
  '825',
  '826',
  '830',
  '831',
  '835',
  '836',
  '837',
  '840',
  '841',
  '845',
  '846',
  '850',
  '851',
  '852',
  '855',
  '856',
  '857',
  '860',
  '861',
  '865',
  '866',
  '867',
  '868',
  '869',
  '870',
  '871',
  '872',
  '873',
  '874',
  '875',
  '876',
  '877',
  '878',
  '879',
  '880',
  '881',
  '882',
  '883',
  '884',
  '885',
  '886',
  '887',
  '888',
  '889',
  '890',
  '891',
  '892',
  '893',
  '894',
  '895',
  '896',
  '908',
  '909',
  '916',
  '919',
  '921',
  '925',
  '926',
  '928',
  '929',
  '931',
  '933',
  '935',
  '936',
  '937',
  '938'
])

function multiplyByCharacterPosition () {
  // Convert all the arguments back into an array as numbers and discard
  // the first position
  const [, ...tail] = [...arguments].map(f => parseInt(f, 10))
  // tail now contains only the digits
  // We need to return an array contain the multiplication product
  // of the digit multiplied by the character position, remembering that
  // we have removed the head, which was at index 0.  So the first character
  // would at index 0 is at character position 2.
  //
  // E.g.                H 8 0 1 2 0 0 0 0 1  0  0  1
  // Character number:   1 2 3 4 5 6 7 8 9 10 11 12 13
  return tail.map((f, idx) => {
    if (!Number.isInteger(f)) {
      return 0
    }
    return f * (idx + 2)
  })
}

module.exports = {
  customValidators: {
    upnHasCorrectCheckLetter: (val, options = {}) => {
      // step 1: multiply all digits by the 'character position'
      // spread the string out into separate args
      const s1 = multiplyByCharacterPosition(...val)
      const sum = s1.reduce((a, b) => a + b)
      const rem = sum % 23
      const expected = remainderLookup[rem]
      if (expected !== val[0]) {
        console.log(`UPN check letter validation failed for [${val}]: expected [${expected}] but got [${val[0]}]`)
        return false
      }
      return true
    },
    upnHasValidLaCode: (val, options = {}) => {
      // The LA Code is characters 2-4
      if (!val && val.length > 4) {
        console.log(`upnHasValidLaCode: val: [${val}] failed check guard`)
        return false
      }
      const laCode = val.substring(1, 4)
      if (!validLaCodes.has(laCode)) {
        console.log(`upnHasValidLaCode: val: [${val}] LA Code [${laCode}] is invalid`)
        return false
      }
      return true
    },
    upnHasValidChars5To12: (val, options = {}) => {
      if (!(/^[A-Z]\d{11}[0-9A-Z]$/.test(val))) {
        console.log(`UPN upnHasValidChars5To12 for [${val}] failed regex check`)
        return false
      }
      return true
    },
    upnHasValidChar13: (val, options = {}) => {
      if (val.length !== 13) {
        console.log(`upnHasValidChar13: val: [${val}] failed length check`)
        return false
      }
      const char = val[12] // 13th char
      if (!/^[A-Z0-9]$/.test(char)) {
        console.log(`upnHasValidChar13: val: [${val}] failed char 13 check`)
        return false
      }
      return true
    }
  } // end custom validators
}
