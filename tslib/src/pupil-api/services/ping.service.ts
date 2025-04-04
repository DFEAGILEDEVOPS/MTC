import * as path from 'path'
import * as fs from 'fs'

export class PingService {
  private commitId = ''
  private buildNumber = ''

  public async getCommitId (): Promise<string> {
    if (this.commitId === '') {
      this.commitId = await this.loadCommitId()
    }
    return this.commitId
  }

  public async getBuildNumber (): Promise<string> {
    if (this.buildNumber === '') {
      this.buildNumber = await this.loadBuildNumber()
    }
    return this.buildNumber
  }

  private async loadCommitId (): Promise<any> {
    return new Promise(function (resolve) {
      const commitFilePath = path.join('./dist', 'commit.txt')
      fs.readFile(commitFilePath, 'utf8', function (err, data) {
        if (err == null) {
          resolve(data)
        } else {
          resolve('NOT FOUND')
        }
      })
    })
  }

  private async loadBuildNumber (): Promise<any> {
    return new Promise(function (resolve) {
      const buildFilePath = path.join('./dist', 'build.txt')
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
