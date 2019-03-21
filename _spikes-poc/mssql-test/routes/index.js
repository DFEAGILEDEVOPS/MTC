const express = require('express');
const router = express.Router();
const sqlService = require('../sql.service')
const R = require('ramda')
const data = 'sample-data '.repeat(1000)

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    const result3 = await sqlService.query('SELECT COUNT(*) FROM [mtc_admin].[sessions]')
    const result = await sqlService.query('SELECT TOP (10) * from [mtc_admin].[school] WHERE NAME LIKE \'%school%\' ORDER BY name')
    const result2 = await sqlService.modify(`INSERT INTO [mtc_admin].[sessions] (sid, expires, sess)
      VALUES (
        NEWID(),
        '2019-03-14T14:06:14.170Z',
        '${data}')`
    )
    const settings = R.head(result)
    res.render('index', { title: 'Express', settings })
  }
  catch (error) {
    console.log('ROUTE CAUGHT ERROR', error)
    next(error)
  }
});

module.exports = router;
