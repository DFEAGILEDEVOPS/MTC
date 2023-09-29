import * as jwt from 'jsonwebtoken'
import config from '../config'

const createJwtAsync = async (payload: any, signingOptions: jwt.SignOptions): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, config.PupilApi.JwtSecret, signingOptions, (err, token) => {
      if (!isNullOrUndefined(err)) { return reject(err) }
      resolve(token)
    })
  })
}

const verifyJwtAsync = async (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.PupilApi.JwtSecret, (err, decoded) => {
      if (!isNullOrUndefined(err)) { return reject(err) }
      return resolve(decoded)
    })
  })
}

function isNullOrUndefined (o: any): boolean {
  return o === null || o === undefined
}

export class JwtService implements IJwtService {
  async sign (payload: object, signingOptions: jwt.SignOptions): Promise<string> {
    return createJwtAsync(payload, signingOptions)
  }

  async verify (token: string): Promise<object | string> {
    return verifyJwtAsync(token)
  }
}

export interface IJwtService {
  sign (payload: object, signingOptions: jwt.SignOptions): Promise<string>
  verify (token: string): Promise<object | string>
}
