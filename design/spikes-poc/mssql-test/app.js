const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const logger = require('./logger')
const sqlService = require('./sql.service')

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

;(async function () {
  let connected = true
  let backOff = 2 // milliseconds
  let startTime
  do {
    startTime = new Date()
    try {
      logger.warn('Attempting to initialise the connection pool')
      await sqlService.initPool()
      connected = true
    } catch (error) {
      // await sleep(2000)
      // process.exit(1)
      await sqlService.drainPool()
      sqlService.pool = null
      logger.warn('Failed to connect to the database: ' + error.message)
      logger.warn('Backing off for ' + backOff + 'ms ')
      await sleep(backOff)
      backOff = backOff * 2
      connected = false
    }
  } while (!connected)
})()

const indexRouter = require('./routes/index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  if (err.code && (err.code === 'ESOCKET' || err.code === 'ECONNCLOSED')) {
    res.locals.message = 'We are having trouble contacting the database'
  }
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
