import * as admZip from 'adm-zip'

export interface IZipService {
  extractEntriesFromZipBuffer (data: Buffer): Array<Buffer>
}

export class ZipService implements IZipService {
  extractEntriesFromZipBuffer (data: Buffer): Array<Buffer> {
    const zipFile = new admZip.default(data)
    const zipEntries = zipFile.getEntries()
    console.log(`there are ${zipEntries.length} entries in the zip. parsing...`)
    const bufferedEntries = new Array<Buffer>()
    for (let index = 0; index < zipEntries.length; index++) {
      const entry = zipEntries[index]
      const entryBuffer = entry.getData()
      console.log(`entry:${index} name:${entry.name} buffer length:${entryBuffer.length} bytes`)
      bufferedEntries.push(entryBuffer)
    }
    console.log(`returning an array of ${bufferedEntries.length} entries`)
    return bufferedEntries
  }
}
