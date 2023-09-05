import * as jwt from 'jsonwebtoken'
import config from '../config'

const createJwtAsync = async (payload: any, signingOptions: jwt.SignOptions): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, config.PupilAuth.JwtSecret, signingOptions, (err, token) => {
      if (err !== undefined) return reject(err)
      resolve(token)
    })
  })
}

const verifyJwtAsync = async (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.PupilAuth.JwtSecret, (err, decoded) => {
      if (err !== undefined) return reject(err)
      resolve(decoded)
    })
  })
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
