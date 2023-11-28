import * as path from 'path'
import * as fs from 'fs'

export class PingService {
  private commitId: string = ''
  private buildNumber: string = ''

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

  private appRootDir: string = ''

  private getAppRootDir (): string {
    if (this.appRootDir !== '') return this.appRootDir
    let currentDir = __dirname
    while (!fs.existsSync(path.join(currentDir, 'package.json'))) {
      currentDir = path.join(currentDir, '..')
    }
    this.appRootDir = currentDir
    return currentDir
  }

  private async loadCommitId (): Promise<any> {
    const rootDir = this.getAppRootDir()
    return new Promise(function (resolve) {
      const commitFilePath = path.join(rootDir, 'commit.txt')
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
    const rootDir = this.getAppRootDir()
    return new Promise(function (resolve) {
      const buildFilePath = path.join(rootDir, 'build.txt')
      console.log(buildFilePath)
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
