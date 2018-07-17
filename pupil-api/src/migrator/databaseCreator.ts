
import { Request, Connection } from 'tedious'
const config = require('../config')
import * as winston from 'winston'

const adminConfig = {
  appName: config.Sql.Application.Name,
  userName: config.Sql.Migrator.Username,
  password: config.Sql.Migrator.Password,
  server: config.Sql.Server,
  debug: true,
  options: {
    database: 'master',
    encrypt: config.Sql.Encrypt,
    requestTimeout: config.Sql.Migrator.Timeout,
    port: config.Sql.Port,
    connectTimeout: config.Sql.Migrator.Timeout
  }
}

class DatabaseCreator {

  create (): Promise<any> {
    return new Promise((resolve, reject) => {
      winston.info(`attempting to connect to ${adminConfig.server} on ${adminConfig.options.port}
                    within ${adminConfig.options.connectTimeout}ms`)
      const connection = new Connection(adminConfig)
      connection.on('connect', async (err) => {
        if (err) {
          winston.error(`Connection error 1: ${err.message}`)
          return reject(err)
        }
        winston.info('About to create new database')
        await this.createDatabase(connection)
        winston.info('DB Created')
        connection.close()
        resolve()
      })
      connection.on('error', (error) => {
        winston.error(`Connection error 2: ${error.message}`)
        return reject(error)
      })
      connection.on('debug', (text) => {
        winston.info(`connection debug: ${text}`)
      })
      connection.on('infoMessage', (info) => {
        winston.info(`server info message: ${info.message}`)
      })
      connection.on('errorMessage', (info) => {
        winston.info(`server error message: ${info.message}`)
      })
    })
  }

  private executeRequest (connection: Connection, sql: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let results = []
      const request = new Request(sql, function (err, rowCount) {
        if (err) {
          return reject(err)
        }
        return resolve(results)
      })

      request.on('row', function (cols) {
        results.push(cols)
      })
      connection.execSql(request)
    })
  }

  private async createDatabase (connection: Connection): Promise<any> {
    try {
      let azureOnlyScaleSetting = ''
      if (config.Sql.Azure.Scale) {
        azureOnlyScaleSetting = `(SERVICE_OBJECTIVE = '${config.Sql.Azure.Scale}')`
      }
      winston.info(`attempting to create database ${config.Sql.Database} ${azureOnlyScaleSetting} if it does not already exist...`)
      const createDbSql = `IF NOT EXISTS(SELECT * FROM sys.databases WHERE name='${config.Sql.Database}')
                            BEGIN CREATE DATABASE [${config.Sql.Database}] ${azureOnlyScaleSetting};
                            SELECT 'Database Created'; END ELSE SELECT 'Database Already Exists'`
      const output = await this.executeRequest(connection, createDbSql)
      winston.info(output[0][0].value)
    } catch (error) {
      console.error(error)
    }
  }
}

export default new DatabaseCreator()
