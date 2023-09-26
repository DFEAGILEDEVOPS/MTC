import { Injectable } from '@angular/core'
import { HttpHeaders } from '@angular/common/http'
import { Buffer } from 'buffer'
import { HttpService } from '../http/http.service'

@Injectable()
export class SubmissionService {

  constructor(private http: HttpService) {}

  submit(payload: object): Promise<any> {
    throw new Error('Method not implemented.')
  }
}
