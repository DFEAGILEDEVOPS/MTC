import * as admZip from 'adm-zip'

export interface IZipService {
  extractEntriesFromZipBuffer (data: Buffer): Array<Buffer>
}

export class ZipService implements IZipService {
  extractEntriesFromZipBuffer (data: Buffer): Array<Buffer> {
    const zipFile = new admZip.default(data)
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
