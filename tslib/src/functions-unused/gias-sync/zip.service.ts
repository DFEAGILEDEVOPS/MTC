// import * as admZip from 'adm-zip'
import AdmZip from 'adm-zip'

export interface IZipService {
  extractEntriesFromZipBuffer (data: Buffer): Buffer[]
}

export class ZipService implements IZipService {
  extractEntriesFromZipBuffer (data: Buffer): Buffer[] {
    const zipFile = new AdmZip(data)
    const zipEntries = zipFile.getEntries()
    const bufferedEntries = new Array<Buffer>()
    for (let index = 0; index < zipEntries.length; index++) {
      const entry = zipEntries[index]
      const entryBuffer = entry.getData()
      bufferedEntries.push(entryBuffer)
    }
    return bufferedEntries
  }
}
