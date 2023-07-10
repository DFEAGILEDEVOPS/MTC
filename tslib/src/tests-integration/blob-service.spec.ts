import { BlobServiceClient } from '@azure/storage-blob'
import { v4 as uuid } from 'uuid'
import config from '../config'
import { BlobService } from '../azure/blob-service'

const commonPrefix = 'mtc-integration-test'
const testRunContainerNames: string[] = []
const connectionString = config.AzureStorage.ConnectionString
let sut: BlobService

function getUniqueName (): string {
  let id = uuid()
  id = id.replace(/-/g, '')
  const name = `${commonPrefix}${id}`
  testRunContainerNames.push(name)
  return name
}

async function createContainer (): Promise<string> {
  const containerName = getUniqueName()
  console.log(`GUY: creating container: ${containerName}`)
  const client = BlobServiceClient.fromConnectionString(connectionString)
  const containerClient = client.getContainerClient(containerName)
  await containerClient.create()
  return containerName
}

async function deleteContainer (containerName: string): Promise<any> {
  console.log(`GUY: deleting container: ${containerName}`)
  const client = BlobServiceClient.fromConnectionString(connectionString)
  return client.deleteContainer(containerName)
}

describe('Blob Service', () => {
  beforeEach(() => {
    sut = new BlobService()
  })

  beforeAll(async () => {
    const client = BlobServiceClient.fromConnectionString(connectionString)
    const iterator = client.listContainers()
    const integrationTestContainers = []
    for await (const container of iterator) {
      if (container.name === undefined) return
      if (container.name.startsWith(commonPrefix)) {
        integrationTestContainers.push(container.name)
      }
    }
    console.log(`GUY: ${integrationTestContainers.length} containers left over to delete before run...`)
    const deletions = integrationTestContainers.map(async t => {
      return client.deleteContainer(t)
    })
    await Promise.all(deletions)
  })

  afterAll(async () => {
    try {
      const deletions = testRunContainerNames.map(async c => {
        return deleteContainer(c)
      })
      await Promise.all(deletions)
    } catch (error) {
      let errorMessage = 'unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      console.warn(`error deleting containers after test run: ${errorMessage}\n
      This is not a fatal error, but you may want to manually delete the containers created by this test run.`)
    }
  })

  describe('deleteBlob()', () => {
    test('it deletes blob when it exists', async () => {
      const containerName = await createContainer()
      const client = BlobServiceClient.fromConnectionString(connectionString)
      const containerClient = client.getContainerClient(containerName)
      const blobName = getUniqueName()
      const blobClient = containerClient.getBlockBlobClient(blobName)
      const data = Buffer.from('foo-bar-baz')
      await blobClient.uploadData(data)
      await sut.deleteBlob(blobName, containerName)
      expect(await blobClient.exists()).toBe(false)
    })

    test('it resolves if blob does not exist', async () => {
      const containerName = await createContainer()
      const blobName = getUniqueName()
      expect(await sut.deleteBlob(blobName, containerName)).toBeUndefined()
    })
  })
})
