const azure = require('azure-storage')
const commandLineArgs = require('command-line-args')
const csv = require('fast-csv')
const fs = require('fs')
const R = require('ramda')
const device = require('device')

const info = `
**************************************************
Error ! One or more of the paramaters are missing!
**************************************************
Options:

-n <mandatory> NAME of the table
-t <mandatory> TOKEN generated for that table
-u <mandatory> URL of the storage <account>.table.core.windows.net
-v <optional>  TYPE of data to be fetched available options:
              [feedback, test]
              default value feedback
-o <optional>  OUTPUT of the output file <name>.csv
              default value TYPE

Usage:

-n TABLENAME -t TOKEN -u xxx.table.core.windows.net -o feedback
`

const optionDefinitions = [
  { name: 'name', alias: 'n', type: String },
  { name: 'token', alias: 't', type: String },
  { name: 'url', alias: 'u', type: String },
  { name: 'output', alias: 'o', type: String },
  { name: 'type', alias: 'v', type: String }
]

const options = commandLineArgs(optionDefinitions)

const retrieveDataToFile = {
  /**
   * 'Readable' column headers to write in the CSV
   */
  headers: {
    feedback: [
      'Comment',
      'First Name',
      'Last Name',
      'Contact Number',
      'Email',
      'School'
    ],
    test: [
      'Device: Type',
      'Device: Model',
      'Device: OS',
      'Device: Agent',
      'Navigator: Platform',
      'Navigator: Language',
      'Navigator: Cookie enabled',
      'Navigator: Do not track',
      'Screen: Screen Width',
      'Screen: Screen Height',
      'Screen: Outer Width',
      'Screen: Outer Height',
      'Screen: Inner Width',
      'Screen: Inner Height',
      'Screen: Colour Depth',
      'Screen: Orientation',
      'Cpu: Hardware concurrency',
      'Battery: Is charging',
      'Battery: Percent',
      'Battery: Charging time',
      'Battery: Discharging time',
      'NetworkConnection: Downlink',
      'NetworkConnection: EffectiveType',
      'NetworkConnection: RTT',
      'Processing time',
      'Connection Speed'
    ]
  },

  /**
   * Paths for the device JSON with all captured details
   */
  deviceDataPaths: [
    ['device', 'type'],
    ['device', 'model'],
    ['device', 'parser', 'useragent', 'os'],
    ['agent'],
    ['navigator', 'platform'],
    ['navigator', 'language'],
    ['navigator', 'cookieEnabled'],
    ['navigator', 'doNotTrack'],
    ['screen', 'screenWidth'],
    ['screen', 'screenHeight'],
    ['screen', 'outerWidth'],
    ['screen', 'outerHeight'],
    ['screen', 'innerWidth'],
    ['screen', 'innerHeight'],
    ['screen', 'colorDepth'],
    ['screen', 'orientation'],
    ['cpu', 'hardwareConcurrency'],
    ['battery', 'isCharging'],
    ['battery', 'levelPercent'],
    ['battery', 'chargingTime'],
    ['battery', 'dischargingTime'],
    ['networkConnection', 'downlink'],
    ['networkConnection', 'effectiveType'],
    ['networkConnection', 'rtt']
  ],

  /**
   * The type => methodToUse mapping used with the type argument
   */
  extractMethod: {
    feedback: 'getFeedbackData',
    test: 'getTestData'
  },

  tableService: null,
  query: null,
  errors: [],
  table: '',

  fetchEntities: function () {
    this.tableService.queryEntities(this.table, this.query, null, (error, result, response) => {
      if (!error) {
        if (response.body.value.length) {
          this.createCSV(response.body.value)
        } else {
          console.log('There are no entries in the table')
        }
      } else {
        console.log(error)
      }
    })
  },

  /**
   * Expand the device JSON object
   */
  extractDeviceData: function (deviceData) {
    if (deviceData.navigator && deviceData.navigator.userAgent) {
      deviceData.device = device(deviceData.navigator.userAgent, { parseUserAgent: true })
      deviceData.agent = deviceData.device.parser.useragent.toAgent()
    }
    const data = this.deviceDataPaths.map(path => R.path(path, deviceData))

    return data
  },

  getTestRowData: function (row) {
    let deviceData
    let deviceDataArr

    try {
      // parse the JSON device data
      // invalid rows will be saved to errors and displayed later
      deviceData = JSON.parse(row.device)
      deviceDataArr = this.extractDeviceData(deviceData)
    } catch (e) {
      this.errors.push(row.RowKey)
      return []
    }

    // add the normal, non-nested columns
    deviceDataArr.push(row.processingTime)
    deviceDataArr.push(row.connectionSpeed)
    return deviceDataArr
  },

  getTestData: function (entities) {
    return entities.map(elem => this.getTestRowData(elem))
  },

  getFeedbackData: function (entities) {
    return entities.map(elem => (
      [elem.comment, elem.firstName, elem.lastName, elem.contactNumber, elem.emailAddress, elem.schoolName]
    ))
  },

  createCSV: function (entities) {
    const data = this[this.extractMethod[this.type]](entities)
    const filename = `${this.output}.csv`

    const ws = fs.createWriteStream(filename)
    ws.write(this.headers[this.type] + '\n')
    csv
      .write(data, { header: false })
      .pipe(ws)

    console.log(`Data is being saved to ${filename}\n`)

    if (this.errors.length === 0) {
      return
    }

    const errorsToSave = 'The following rows could not be saved:\n' + this.errors.join('\n')

    console.log('Some of the rows werent saved in the CSV file. Saving errors... \n')

    fs.writeFile('errors.csv', errorsToSave, error => {
      if (error) {
        return console.log(error)
      }

      console.log('The list of unsaved rows IDs can be found in errors.csv')
    })
  },

  start: function (options) {
    if (!options.name || !options.token || !options.url) {
      return console.log(info)
    }

    console.log('Fetching data... \n')

    this.table = options.name
    this.type = options.type || 'feedback'
    this.output = options.output || this.type

    this.tableService = azure.createTableServiceWithSas(options.url, options.token)
    this.query = new azure.TableQuery()
    this.fetchEntities()
  }
}

retrieveDataToFile.start(options)
