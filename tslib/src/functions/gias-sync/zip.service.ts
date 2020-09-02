import * as admZip from 'adm-zip'

export interface IZipService {
  extractEntriesFromZipBuffer (data: Buffer): Array<Buffer>
}

export class ZipService implements IZipService {
  extractEntriesFromZipBuffer (data: Buffer): Array<Buffer> {
    const zipFile = new admZip.default(data)
    const zipEntries = zipFile.getEntries()
    const bufferedEntries = new Array<Buffer>(zipEntries.length)
    zipEntries.map(z => bufferedEntries.push(z.getData()))
    return bufferedEntries
  }
}
