export class JwtSecretValidator {
  static validate (jwtSecret?: string | null): void {
    if (jwtSecret === undefined || jwtSecret === null) {
      throw new Error('JWT secret cannot be null or undefined')
    }
    if (jwtSecret.length < 32) {
      throw new Error('JWT secret must be at least 32 characters in length')
    }
  }
}
