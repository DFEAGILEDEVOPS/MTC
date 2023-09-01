import { SubmitController } from './submit.controller'
import * as httpMocks from 'node-mocks-http'
import type { Request } from 'express'
import { CheckSubmitService, type ICheckSubmitService } from '../services/check-submit.service'

let req: Request
let res: any
let sut: SubmitController
let checkSubmitService: ICheckSubmitService

function createMockRequest (contentType: string): any {
  return httpMocks.createRequest({
    method: 'POST',
    url: '/submit',
    headers: {
      'Content-Type': `${contentType}`,
      'Content-Length': '42' // needed to make `req.is` work
    }
  })
}

describe('submit controller', () => {
  beforeEach(() => {
    req = createMockRequest('application/json')
    req.body = { checkCode: '38f666df-244c-4dff-828f-4ffad7e60e4b' }
    res = httpMocks.createResponse()
    checkSubmitService = new CheckSubmitService()
    sut = new SubmitController(checkSubmitService)
    jest.spyOn(checkSubmitService, 'submit')
  })
})
