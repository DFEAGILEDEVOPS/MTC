'use strict';
const sqlService = require('./sql.service');
const TYPES = require('tedious').TYPES;
const R = require('ramda');
const table = '[check]';
const checkDataService = {
    /**
     * Update the check, setting the startedAt field
     * @param checkCode
     * @param startedAt
     * @return {Promise}
     */
    sqlUpdateCheckStartedAt: async (checkCode, startedAt) => {
        const sql = `UPDATE ${sqlService.adminSchema}.${table} SET startedAt=@startedAt WHERE checkCode=@checkCode AND startedAt IS NULL`;
        const params = [
            {
                name: 'startedAt',
                value: startedAt,
                type: TYPES.DateTimeOffset
            },
            {
                name: 'checkCode',
                value: checkCode,
                type: TYPES.UniqueIdentifier
            }
        ];
        return sqlService.modify(sql, params);
    },
    /**
     * Find a Check by its checkCode UUID
     * @param checkCode *
     * @return {Promise}
     */
    sqlFindOneByCheckCode: async function (checkCode) {
        const params = [
            {
                name: 'checkCode',
                value: checkCode,
                type: TYPES.UniqueIdentifier
            }
        ];
        const result = await sqlService.query(`SELECT * FROM ${sqlService.adminSchema}.[check] WHERE checkCode=@checkCode`, params);
        return R.head(result);
    },
    sqlUpdateCheckWithResults: async (checkCode, mark, maxMark, markedAt) => {
        const sql = `UPDATE ${sqlService.adminSchema}.[check]
    SET mark=@mark,
    maxMark=@maxMark,
    markedAt=@markedAt
    WHERE checkCode=@checkCode`;
        const params = [
            {
                name: 'checkCode',
                value: checkCode,
                type: TYPES.UniqueIdentifier
            },
            {
                name: 'mark',
                value: mark,
                type: TYPES.TinyInt
            },
            {
                name: 'maxMark',
                value: maxMark,
                type: TYPES.TinyInt
            },
            {
                name: 'markedAt',
                value: markedAt,
                type: TYPES.DateTimeOffset
            }
        ];
        return sqlService.modify(sql, params);
    }
};
module.exports = checkDataService;
