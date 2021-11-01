import * as path from 'path'
import * as fs from 'fs'

export class PingService {
  public async getCommitId (): Promise<any> {
    return new Promise(function (resolve) {
      const commitFilePath = path.join(__dirname, '..', 'commit.txt')
      fs.readFile(commitFilePath, 'utf8', function (err, data) {
        if (err == null) {
          resolve(data)
        } else {
          resolve('NOT FOUND')
        }
      })
    })
  }

  public async getBuildNumber (): Promise<any> {
    return new Promise(function (resolve) {
      const buildFilePath = path.join(__dirname, '..', 'build.txt')
      fs.readFile(buildFilePath, 'utf8', function (err, data) {
        if (err == null) {
          resolve(data)
        } else {
          resolve('NOT FOUND')
        }
      })
    })
  }
}
