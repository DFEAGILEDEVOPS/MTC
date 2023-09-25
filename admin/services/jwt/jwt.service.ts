import * as jwt from 'jsonwebtoken'
import config from '../../config'

function isNullOrUndefined (o: any): boolean {
  return o === null || o === undefined
}

export class JwtService implements IJwtService {
  async sign (payload: object, signingOptions: jwt.SignOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, config.PupilApi.Submission.JwtSecret, signingOptions, (err, token) => {
        if (!isNullOrUndefined(err)) { reject(err) }
        resolve(token ?? '')
      })
    })
  }

  async verify (token: string): Promise<object | string> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, config.PupilApi.Submission.JwtSecret, (err, decoded) => {
        if (!isNullOrUndefined(err)) { reject(err) }
        resolve(decoded ?? '')
      })
    })
  }

  static instance: JwtService

  static getInstance (): JwtService {
    if (this.instance === undefined) {
      this.instance = new JwtService()
    }
    return this.instance
  }
}

export interface IJwtService {
  sign (payload: object, signingOptions: jwt.SignOptions): Promise<string>
  verify (token: string): Promise<object | string>
}
