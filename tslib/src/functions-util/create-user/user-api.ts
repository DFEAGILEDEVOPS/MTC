import { type ISqlService, SqlService } from '../../sql/sql.service'
import { ConsoleLogger, type ILogger } from '../../common/logger'
import { TYPES } from 'mssql'
import * as R from 'ramda'
// @ts-ignore - bcryptjs not very ts friendly
import * as bcrypt from 'bcryptjs'

export interface ICreateUserModel {
  schoolUUID: string
  identifier: string
  password: string
  role: string
}

export class UserApi {
  private readonly sqlService: ISqlService
  private readonly logger: ILogger

  constructor (logger?: ILogger, sqlService?: ISqlService) {
    this.logger = logger ?? new ConsoleLogger()
    this.sqlService = sqlService ?? new SqlService(this.logger)
  }

  public async create (newUserInfo: ICreateUserModel): Promise<object> {
    this.logger.trace('UserAPI: create() called')
    const { schoolUUID, identifier, password, role } = newUserInfo
    if (role.toUpperCase() !== 'TEACHER') {
      throw new Error('Only the `teacher` role is supported')
    }
    if (password === undefined || password.length < 8) {
      throw new Error('password must be 8 or more characters long')
    }
    const passwordHash = this.generatePasswordHash(password)
    const sql = `
        DECLARE @schoolId INT = (SELECT id
                                   FROM mtc_admin.school
                                  WHERE urlSlug = @urlSlug);
        DECLARE @errorMessage NVARCHAR(max);
        DECLARE @roleId INT;

        IF @schoolId IS NULL
            BEGIN
                SET @errorMessage = 'School not found with urlSlug ' + CAST(@urlSlug as NVARCHAR(max));
                THROW 50001, @errorMessage, 1;
            END

        -- Find the role ID
        SET @roleID = (SELECT TOP 1 id
                         FROM mtc_admin.role
                        WHERE title = @roleTitle);
        IF @roleId IS NULL
            BEGIN
                SET @errorMessage = 'Role not found with title ' + @roleTitle;
                THROW 50001, @errorMessage, 1;
            END


        INSERT INTO mtc_admin.[user] (passwordHash, school_id, role_id, identifier)
        VALUES (@passwordHash, @schoolId, @roleId, @identifier)
    `
    const params = [
      { name: 'urlSlug', value: schoolUUID, type: TYPES.UniqueIdentifier },
      { name: 'passwordHash', value: passwordHash, type: TYPES.NVarChar },
      { name: 'roleTitle', value: role.toUpperCase(), type: TYPES.NVarChar },
      { name: 'identifier', value: identifier, type: TYPES.NVarChar(64) }
    ]
    await this.sqlService.modify(sql, params)
    const data = await this.sqlService.query('SELECT * from mtc_admin.[user] WHERE identifier = @identifier', [{
      name: 'identifier',
      value: identifier,
      type: TYPES.NVarChar
    }])
    // @ts-ignore - ramda and ts don't work so well together
    return R.head(data)
  }

  private generatePasswordHash (password: string): string {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(password, salt)
    return hash
  }
}
