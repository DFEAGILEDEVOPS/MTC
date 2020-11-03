import { UAParser } from 'ua-parser-js'

enum SemanticVersion { 'major', 'minor', 'patch'}

export class UserAgentParser {
  public uaParsed: any

  constructor (userAgent: string) {
    this.uaParsed = new UAParser(userAgent)
  }

  public getBrowserFamily (): string {
    const browser = this.uaParsed.getBrowser()
    return browser.name
  }

  private parseVersionField (field: string | undefined, semver: SemanticVersion): Number | null {
    if (field === '' || field === undefined) {
      return null
    }
    const matches = field.split('.')
    if (matches.length === 0) {
      return null
    }
    if (matches?.[semver] !== undefined) {
      return Number(matches[semver])
    }
    return null
  }

  private getBrowserVersionField (semver: SemanticVersion): Number | null {
    const browser = this.uaParsed.getBrowser()
    return this.parseVersionField(browser.version, semver)
  }

  private getOSVersionField (semver: SemanticVersion): Number | null {
    const os = this.uaParsed.getOS()
    return this.parseVersionField(os.version, semver)
  }

  public getBrowserMajorVersion (): Number | null {
    return this.getBrowserVersionField(SemanticVersion.major)
  }

  public getBrowserMinorVersion (): Number | null {
    return this.getBrowserVersionField(SemanticVersion.minor)
  }

  public getBrowserPatchVersion (): Number | null {
    return this.getBrowserVersionField(SemanticVersion.patch)
  }

  public getOperatingSystem (): string | null {
    const os = this.uaParsed.getOS()
    return os.name ?? null
  }

  public getOperatingSystemMajorVersion (): Number | null {
    return this.getOSVersionField(SemanticVersion.major)
  }

  public getOperatingSystemMinorVersion (): Number | null {
    return this.getOSVersionField(SemanticVersion.minor)
  }

  public getOperatingSystemPatchVersion (): Number | null {
    return this.getOSVersionField(SemanticVersion.patch)
  }
}
