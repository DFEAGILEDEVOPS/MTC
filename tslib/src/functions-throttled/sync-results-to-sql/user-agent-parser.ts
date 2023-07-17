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

  private parseVersionField (field: string | undefined, semver: SemanticVersion): number | null {
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

  private getBrowserVersionField (semver: SemanticVersion): number | null {
    const browser = this.uaParsed.getBrowser()
    return this.parseVersionField(browser.version, semver)
  }

  private getOSVersionField (semver: SemanticVersion): number | null {
    const os = this.uaParsed.getOS()
    return this.parseVersionField(os.version, semver)
  }

  public getBrowserMajorVersion (): number | null {
    return this.getBrowserVersionField(SemanticVersion.major)
  }

  public getBrowserMinorVersion (): number | null {
    return this.getBrowserVersionField(SemanticVersion.minor)
  }

  public getBrowserPatchVersion (): number | null {
    return this.getBrowserVersionField(SemanticVersion.patch)
  }

  public getOperatingSystem (): string | null {
    const os = this.uaParsed.getOS()
    return os.name ?? null
  }

  public getOperatingSystemMajorVersion (): number | null {
    return this.getOSVersionField(SemanticVersion.major)
  }

  public getOperatingSystemMinorVersion (): number | null {
    return this.getOSVersionField(SemanticVersion.minor)
  }

  public getOperatingSystemPatchVersion (): number | null {
    return this.getOSVersionField(SemanticVersion.patch)
  }
}
