import { type Context } from '@azure/functions'
import { CompressionService } from '../../common/compression-service'
const svc = new CompressionService()

export default async function (context: Context): Promise<void> {
  const input = context?.req?.body
  if (input === undefined) {
    context.res = {
      status: 400,
      body: 'input is required'
    }
    return
  }
  let compressed: string = ''
  try {
    compressed = svc.compressToBase64(input)
  } catch (error) {
    let msg = 'unknown error'
    if (error instanceof Error) {
      msg = error.message
    }
    context.res = {
      status: 500,
      body: `An error occured: ${msg}`
    }
    return
  }

  context.res = {
    status: 200,
    body: {
      compressed
    }
  }
}
