import { ConnectionPool } from 'mssql'
import { ConsoleLogger, type ILogger } from '../common/logger'
import config from '../config'

let pool: ConnectionPool

// pool can still be connecting when first used...
// https://github.com/tediousjs/node-mssql/issues/934
export async function getInstance (logger?: ILogger): Promise<ConnectionPool> {
  if (logger === undefined) {
    logger = new ConsoleLogger()
  }

  if (pool === undefined) {
    pool = new ConnectionPool(config.Sql)
    await pool.connect()
    pool.on('error', (error) => {
      logger?.error(`Sql Connection Pool Error Raised:${error.message}`)
    })
  }

  if (pool.connected) {
    return pool
  }

  if (!pool.connecting && !pool.connected) {
    // may have been closed, reconnect....
    await pool.connect()
  }

  if (pool.connecting) {
    await waitForConnection()
  }

  if (!pool.connected) {
    throw new Error('pool failed to connect after setup')
  }
  return pool
}

/**
 * @description idea taken from https://github.com/tediousjs/node-mssql/issues/934
 */
async function waitForConnection (): Promise<void> {
  let millisecondsPassed = 0
  const waitForConnectionPoolToBeReadyExecutor = async (
    resolve: (value?: PromiseLike<undefined> | undefined) => void,
    reject: (reason?: any) => void
  ): Promise<void> => {
    setTimeout(() => {
      if (millisecondsPassed < 30000) {
        millisecondsPassed += 2000
        if (pool.connected) {
          resolve()
        } else {
          waitForConnectionPoolToBeReadyExecutor(resolve, reject)
        }
      } else {
        reject('Aborting start because the connection pool failed to initialize in the last ~30s.')
      }
    }, 2000)
  }

  // This simply waits for  30 seconds, for the pool to become connected.
  // Since this is also an async function, if this fails after 30 seconds, execution stops
  // and an error is thrown.
  await new Promise(waitForConnectionPoolToBeReadyExecutor)
}
