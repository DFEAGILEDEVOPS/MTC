import { GiasService } from './gias.service'
import { ISoapMessageBuilder, ISoapMessageSpecification, SoapMessageBuilder } from './soap-message-builder'
import { v4 as uuid } from 'uuid'
import { SoapRequestService, ISoapRequestService } from './soap-request.service'
import config from '../../config'

const SoapMessageBuilderMock = jest.fn<ISoapMessageBuilder, any>(() => ({
  buildMessage: jest.fn()
}))
const SoapRequestServiceMock = jest.fn<ISoapRequestService, any>(() => ({
  execute: jest.fn()
}))
let sut: GiasService
let soapMessageBuilderMock: ISoapMessageBuilder
let soapRequestServiceMock: ISoapRequestService

const extractId = 'extractId'

describe('GiasSyncService', () => {
  beforeEach(() => {
    config.Gias.Namespace = 'gias.ns'
    config.Gias.ServiceUrl = 'gias.url'
    config.Gias.Username = 'foo'
    config.Gias.Password = 'bar'
    soapMessageBuilderMock = new SoapMessageBuilderMock()
    soapRequestServiceMock = new SoapRequestServiceMock()
    sut = new GiasService(soapMessageBuilderMock, soapRequestServiceMock)
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('GetExtract:should propogate original error details when a fault occurs', async () => {
    const errorInfo = `errorId:${uuid()}`
    try {
      soapMessageBuilderMock.buildMessage = jest.fn(() => { throw new Error(errorInfo) })
      await sut.GetExtract(extractId)
      fail('error should have been thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toEqual(errorInfo)
    }
  })

  test('GetExtract: soapMessage should reflect extract specification', async () => {
    let capturedSpecification: ISoapMessageSpecification = {
      action: '',
      messageExpiryMs: 0,
      namespace: ''
    }
    soapMessageBuilderMock.buildMessage = jest.fn((messageSpec) => {
      capturedSpecification = messageSpec
      return ''
    })
    await sut.GetExtract(extractId)
    expect(capturedSpecification).toBeDefined()
    expect(capturedSpecification.action).toEqual('GetExtract')
    expect(capturedSpecification.parameters).toBeDefined()
    expect(capturedSpecification.parameters['Id']).toEqual(extractId)
  })

  test('when namespace is not defined an error is thrown', async () => {
    try {
      config.Gias.Namespace = undefined
      await sut.GetExtract(extractId)
      fail('error was expected to be thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toEqual('gias web service namespace is required')
    }
  })

  test('when serviceUrl is not defined an error is thrown', async () => {
    try {
      config.Gias.ServiceUrl = undefined
      await sut.GetExtract(extractId)
      fail('error was expected to be thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toEqual('gias service url is required')
    }
  })

  test('when username is not defined an error is thrown', async () => {
    try {
      config.Gias.Username = undefined
      await sut.GetExtract(extractId)
      fail('error was expected to be thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toEqual('gias username is required')
    }
  })

  test('when password is not defined an error is thrown', async () => {
    try {
      config.Gias.Password = undefined
      await sut.GetExtract(extractId)
      fail('error was expected to be thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toEqual('gias password is required')
    }
  })

  test.todo('GetExtract: verify returned data structure')

  test.skip('GetExtract:should return an empty object if no results', async () => {
    const extractResult = await sut.GetExtract(extractId)
    expect(extractResult).toBeDefined()
    expect(extractResult.extractId).toEqual(extractId)
    expect(extractResult.data).toBeDefined()
    expect(extractResult.data.length).toBe(0)
  })

  test.only('gias e2e call', async () => {
    config.Gias.Namespace = process.env.GIAS_WS_NAMESPACE || ''
    config.Gias.ServiceUrl = process.env.GIAS_WS_SERVICE_URL || ''
    config.Gias.Username = process.env.GIAS_WS_USERNAME || ''
    config.Gias.Password = process.env.GIAS_WS_PASSWORD || ''
    const gias = new GiasService()
    const response = await gias.GetEstablishment(100044)
    console.dir(response)
  })

  test.skip('to remove: e2e call', async () => {
    require('dotenv').config()
    const messageSpec: ISoapMessageSpecification = {
      action: 'GetEstablishment',
      messageExpiryMs: 10000,
      namespace: process.env.WS_NS || '',
      credentials: {
        username: process.env.WS_USERNAME || '',
        password: process.env.WS_PASSWORD || ''
      },
      parameters: {
        Urn: 100044
      }
    }

    const soapMessageBuilder = new SoapMessageBuilder()
    const soapMessage = soapMessageBuilder.buildMessage(messageSpec)
    const svc = new SoapRequestService()
    const response = await svc.execute({
      action: messageSpec.action,
      namespace: messageSpec.namespace,
      serviceUrl: process.env.WS_ENDPOINT || '',
      soapXml: soapMessage,
      timeout: messageSpec.messageExpiryMs
    })
    console.dir(response)
  })

})
