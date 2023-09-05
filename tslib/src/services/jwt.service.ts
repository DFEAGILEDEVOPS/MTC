import * as jwt from 'jsonwebtoken'
import config from '../config'

const defaultJwtSignOptions: jwt.SignOptions = {
  algorithm: 'ES256'
}

const createJwt = async (payload: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, config.PupilAuth.JwtSecret, defaultJwtSignOptions, (err, token) => {
      if (err !== undefined) return reject(err)
      resolve(token)
    })
  })
}

export class JwtService {
  private readonly secret: string

  constructor () {
    this.secret = config.PupilAuth.JwtSecret
  }

  async sign (payload: object): Promise<string> {
    return createJwt(payload)
  }

  verify (token: string): object | string {
    return jwt.verify(token, this.secret)
  }
}
