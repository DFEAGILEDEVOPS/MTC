const azure = require('azure-storage')
const commandLineArgs = require('command-line-args')
const fs = require('fs')

const info = `
**************************************************
Error ! One ro more of the paramaters are missing!
**************************************************
Options:

-n <mandatory> NAME of the table
-t <mandatory> TOKEN generated for that table 
-k <mandatory> PARTITION ID where data is stored
-u <mandatory> URL of the storage <account>.table.core.windows.net
-v <optional>  TYPE of data to be fetched available options:
              [feedback, test]
              default value feedback
-o <optional>  OUTPUT of the output file <name>.csv
              default value TYPE

Usage:

-n TABLENAME -t TOKEN -k PARTITION_ID -u xxx.table.core.windows.net -o feedback
`

const optionDefinitions = [
  { name: 'name', alias: 'n', type: String },
  { name: 'token', alias: 't', type: String },
  { name: 'partition_key', alias: 'k', type: String },
  { name: 'url', alias: 'u', type: String },
  { name: 'output', alias: 'o', type: String },
  { name: 'type', alias: 'v', type: String }
]

const options = commandLineArgs(optionDefinitions)

const retrieveDataToFile = {
  columns: {
    feedback: [
      'Comment',
      'First Name',
      'Last Name',
      'Contact Number',
      'Email',
      'School \n'
    ],
    test: [
      'Battery: Is charging',
      'Battery: Percent',
      'Battery: Charging time',
      'Battery: Discharging time',
      'Cpu: Hardware concurrency',
      'Navigator: User agent',
      'Navigator: Platform',
      'Navigator: Language',
      'Navigator: Cookie enabled',
      'Navigator: Do not track',
      'NetworkConnection: Downlink',
      'NetworkConnection: EffectiveType',
      'NetworkConnection: RRT',
      'Screen: Screen Width',
      'Screen: Screen Height',
      'Screen: Outer Width',
      'Screen: Outer Height',
      'Screen: Inner Width',
      'Screen: Inner Height',
      'Screen: Colour Depth',
      'Screen: Orientation',
      'Processing time',
      'Connection Speed \n'
    ]
  },

  extractMethod: {
    feedback: 'getFeedbackData',
    test: 'getTestData'
  },

  tableService: null,
  query: null,
  errors: [],
  table: '',

  fetchEntities: function() {
    this.tableService.queryEntities(this.table, this.query, null, (error, result, response) => {
      if(!error){
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
  
  extractDeviceData: function(deviceData) {
    let data = []
    
    Object.keys(deviceData).map(keyName => {
      for (let key in deviceData[keyName]) {
        if (key === 'userAgent') {
          // comma in user agent breaks csv
          data.push(deviceData[keyName][key].replace(',', ' '))
          continue
        }
        data.push(deviceData[keyName][key])
      }
    })

    return data
  },

  getRowData: function(row) {
    let deviceData = JSON.parse(row.device)
    let deviceDataArr

    try {
      //device data is saved as json
      //if parsing json faile reow id will be pushed to thiserrors
      //and saved to errors.csv
      deviceDataArr = this.extractDeviceData(deviceData)
    } catch(e) {
      this.errors.push(row.RowKey)
      return []
    }
    
    //add not nested columns
    deviceDataArr.push(row.processingTime)
    deviceDataArr.push(row.connectionSpeed)
    return deviceDataArr
  },

  getTestData: function(entities) {
    return entities.map(elem => {
      return this.getRowData(elem)
    })
  },

  getFeedbackData: function(entities) {
    return entities.map(elem => {
      return [elem.comment, elem.firstName, elem.lastName, elem.contactNumber, elem.emailAddress, elem.schoolName]
    }).join('\n')
  },

  createCSV: function(entities) {
    const data = this[this.extractMethod[this.type]](entities)
    const toSave = this.columns[this.type] + data;
    const filename = `${this.output}.csv`

    fs.writeFile(filename, toSave, error => {
      if (error) {
          return console.log(error)
      }
  
      console.log(`Data saved to ${filename}`)

      if (this.errors.length) {
        const errorsToSave = 'Not saved rows \n' + this.errors.join('\n')

        console.log('\nSome of the rows werent saved in the CSV file. Saving errors... \n')

        fs.writeFile('errors.csv', errorsToSave, error => {
          if (error) {
            return console.log(error)
          }

          console.log('List of not saved rows IDs can be found here: erros.csv')
        })
      }
    })
  },

  start: function(options) {
    if (!options.name || !options.token || !options.partition_key || !options.url) {
        return console.log(info)
    }

    console.log('Fetching data... \n')

    this.table = options.name
    this.type = options.type || 'feedback'
    this.output = options.output || this.type

    this.tableService = azure.createTableServiceWithSas(options.url, options.token)
    this.query = new azure.TableQuery().where('PartitionKey eq ?', options.partition_key)
    this.fetchEntities()
  }
}

retrieveDataToFile.start(options)
