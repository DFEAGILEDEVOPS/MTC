import type { Request, Response } from 'express'
import { validate as isUuid } from 'uuid'
import { JwtService, type IJwtService } from '../../services/jwt.service.js'
import { CheckStartedDataService, type ICheckStartedDataService } from '../../functions/check-started/check-started.data.service.js'
import apiResponse from '../helpers/api-response.js'
import logger from '../services/log.service.js'

export class CheckStartController {
  constructor (
    private readonly jwtService: Pick<IJwtService, 'verify'> = new JwtService(),
    private readonly dataService: Pick<ICheckStartedDataService, 'acknowledgeStart'> = new CheckStartedDataService()
  ) {}

  async postStart (req: Request, res: Response): Promise<Response> {
    if (!req.is('application/json')) return apiResponse.badRequest(res)
    const { checkCode, attemptId } = req.body ?? {}
    if (typeof checkCode !== 'string' || !isUuid(checkCode) ||
        typeof attemptId !== 'string' || !isUuid(attemptId)) return apiResponse.badRequest(res)

    const [scheme, token] = (req.headers.authorization ?? '').split(' ')
    if (scheme !== 'Bearer' || !token) return apiResponse.unauthorised(res)
    try {
      const claims = await this.jwtService.verify(token)
      if (typeof claims !== 'object' || claims === null ||
          !('checkCode' in claims) || typeof claims.checkCode !== 'string' ||
          claims.checkCode.toLowerCase() !== checkCode.toLowerCase()) return apiResponse.unauthorised(res)
    } catch (error) {
      logger.error(`Check start token verification failed: ${String(error)}`)
      return apiResponse.unauthorised(res)
    }

    try {
      const approved = await this.dataService.acknowledgeStart(checkCode, attemptId)
      return approved ? apiResponse.sendJson(res, {}) : apiResponse.emergencyOffSwitchEnabled(res)
    } catch (error) {
      logger.error(`Failed to acknowledge check start: ${String(error)}`)
      return apiResponse.serverError(res)
    }
  }
}
