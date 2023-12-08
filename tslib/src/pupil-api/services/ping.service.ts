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

  private distDir: string = ''

  private getDistDirectoryPath (): string {
    if (this.distDir !== '') return this.distDir
    let currentDir = __dirname
    const failSafe = 20
    let count = 0
    while (!fs.existsSync(path.join(currentDir, 'config.js'))) {
      currentDir = path.join(currentDir, '..')
      count++
      if (count === failSafe) {
        return './'
      }
    }
    this.distDir = currentDir
    return currentDir
  }

  private async loadCommitId (): Promise<any> {
    const distDir = this.getDistDirectoryPath()
    return new Promise(function (resolve) {
      const commitFilePath = path.join(distDir, 'commit.txt')
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
    const distDir = this.getDistDirectoryPath()
    return new Promise(function (resolve) {
      const buildFilePath = path.join(distDir, 'build.txt')
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
