import * as jwt from 'jsonwebtoken'
import config from '../../config'

function isNullOrUndefined (o: any): boolean {
  return o === null || o === undefined
}

export class JwtService {
  async sign (payload: object, signingOptions: jwt.SignOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, config.PupilApi.Submission.JwtSecret, signingOptions, (err, token) => {
        if (!isNullOrUndefined(err)) { reject(err) }
        if (token !== undefined) {
          resolve(token)
        } else {
          reject(new Error('unknown error: Payload could not be signed'))
        }
      })
    })
  }

  async verify (token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, config.PupilApi.Submission.JwtSecret, (err, decoded) => {
        if (!isNullOrUndefined(err)) { reject(err) }
        if (decoded !== undefined) {
          resolve(decoded)
        } else {
          reject(new Error('payload could not be verified'))
        }
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
